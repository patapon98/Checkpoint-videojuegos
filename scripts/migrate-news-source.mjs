import { readFile, writeFile } from "node:fs/promises";
import vm from "node:vm";

const DATA_PATH = "js/news-data.js";
const CORE_PATH = "js/news-core.js";
const LOADER_PATH = "js/news.js";

function findBalanced(source, start, openChar, closeChar) {
  let depth = 0;
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === quote) quote = "";
      continue;
    }
    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === openChar) depth += 1;
    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  throw new Error(`No se encontró el cierre ${closeChar}`);
}

function extractExpression(source, marker, openChar, closeChar) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) return null;
  const start = source.indexOf(openChar, markerIndex + marker.length);
  if (start < 0) throw new Error(`No se encontró ${openChar} después de ${marker}`);
  const end = findBalanced(source, start, openChar, closeChar);
  return { start, end, source: source.slice(start, end + 1) };
}

function evaluateExpression(source) {
  return vm.runInNewContext(`(${source})`, Object.create(null), { timeout: 1000 });
}

function loadNews(source) {
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { timeout: 1000 });
  if (!Array.isArray(sandbox.window.FINALSECRETO_NEWS)) {
    throw new Error("js/news-data.js no define window.FINALSECRETO_NEWS");
  }
  return structuredClone(sandbox.window.FINALSECRETO_NEWS);
}

function injectedNews(source) {
  const window = { FINALSECRETO_NEWS: [] };
  const document = {
    head: { appendChild() {} },
    createElement() { return {}; },
    querySelectorAll() { return []; }
  };
  const sandbox = { window, document, console };
  try {
    vm.runInNewContext(source, sandbox, { timeout: 1000 });
  } catch (error) {
    throw new Error(`No se pudo inspeccionar js/news.js: ${error.message}`);
  }
  return structuredClone(window.FINALSECRETO_NEWS);
}

function timestamp(item) {
  const value = item.publishedAt || `${item.date}T12:00:00Z`;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

const [dataSource, coreSource, loaderSource] = await Promise.all([
  readFile(DATA_PATH, "utf8"),
  readFile(CORE_PATH, "utf8"),
  readFile(LOADER_PATH, "utf8")
]);

const news = loadNews(dataSource);
const detailsExpression = extractExpression(coreSource, "const homeDetails =", "{", "}");
const existingDetails = detailsExpression ? evaluateExpression(detailsExpression.source) : {};

for (const item of news) {
  if (!item.homeDetails && existingDetails[item.id]) {
    item.homeDetails = structuredClone(existingDetails[item.id]);
  }
}

const injected = injectedNews(loaderSource);
const expandedExpression = extractExpression(loaderSource, "const expanded =", "[", "]");
const expanded = expandedExpression ? evaluateExpression(expandedExpression.source) : null;

for (const item of injected) {
  if (!news.some((candidate) => candidate.id === item.id)) news.push(item);
  const target = news.find((candidate) => candidate.id === item.id);
  if (target && !target.homeDetails && Array.isArray(expanded)) {
    target.homeDetails = { es: structuredClone(expanded) };
  }
}

news.sort((left, right) => timestamp(right) - timestamp(left));

const nextData = `// Fuente estructurada única para portada, Noticias y ticker.\nwindow.FINALSECRETO_NEWS = ${JSON.stringify(news, null, 2)};\n`;

let nextCore = coreSource;
if (detailsExpression) {
  const markerIndex = nextCore.indexOf("const homeDetails =");
  const lineStart = nextCore.lastIndexOf("\n", markerIndex) + 1;
  let end = detailsExpression.end + 1;
  while (nextCore[end] === " " || nextCore[end] === "\t") end += 1;
  if (nextCore[end] === ";") end += 1;
  if (nextCore[end] === "\r") end += 1;
  if (nextCore[end] === "\n") end += 1;
  nextCore = nextCore.slice(0, lineStart) + nextCore.slice(end);
}
nextCore = nextCore.replaceAll("homeDetails[item.id]", "item.homeDetails");
if (/\bhomeDetails\s*\[/.test(nextCore)) {
  throw new Error("Quedan referencias al mapa antiguo homeDetails en js/news-core.js");
}

const nextLoader = `(function () {
  const script = document.createElement("script");
  script.src = "/js/news-core.js";
  script.onerror = function () {
    console.error("No se pudo cargar el motor de Noticias.");
  };
  document.head.appendChild(script);
})();
`;

const writes = [];
if (nextData !== dataSource) writes.push(writeFile(DATA_PATH, nextData));
if (nextCore !== coreSource) writes.push(writeFile(CORE_PATH, nextCore));
if (nextLoader !== loaderSource) writes.push(writeFile(LOADER_PATH, nextLoader));
await Promise.all(writes);

console.log(`Noticias normalizadas: ${news.length}. Archivos modificados: ${writes.length}.`);

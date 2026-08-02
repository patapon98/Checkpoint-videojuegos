import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const allowedCategories = new Set(["Juegos", "Lanzamientos", "Plataformas", "Industria"]);
const errors = [];

function loadNews(source) {
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { timeout: 1000 });
  return sandbox.window.FINALSECRETO_NEWS;
}

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || "") &&
    !Number.isNaN(Date.parse(`${value}T12:00:00Z`));
}

const [dataSource, coreSource, loaderSource, indexHtml, newsHtml] = await Promise.all([
  readFile("js/news-data.js", "utf8"),
  readFile("js/news-core.js", "utf8"),
  readFile("js/news.js", "utf8"),
  readFile("index.html", "utf8"),
  readFile("noticias.html", "utf8")
]);

const news = loadNews(dataSource);
expect(Array.isArray(news), "window.FINALSECRETO_NEWS debe ser un array");

const ids = new Set();
let featuredCount = 0;
let previousTime = Infinity;

for (const [index, item] of (news || []).entries()) {
  const prefix = `Noticia ${index + 1}${item?.id ? ` (${item.id})` : ""}`;
  expect(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item?.id || ""), `${prefix}: id inválido`);
  expect(!ids.has(item?.id), `${prefix}: id duplicado`);
  ids.add(item?.id);

  expect(allowedCategories.has(item?.category?.es), `${prefix}: categoría inválida`);
  expect(isDate(item?.date), `${prefix}: fecha inválida`);
  if (item?.publishedAt) {
    expect(!Number.isNaN(Date.parse(item.publishedAt)), `${prefix}: publishedAt inválido`);
    expect(item.publishedAt.startsWith(item.date), `${prefix}: publishedAt no coincide con date`);
  }

  const time = Date.parse(item?.publishedAt || `${item?.date}T12:00:00Z`);
  expect(time <= previousTime, `${prefix}: orden cronológico incorrecto`);
  previousTime = time;

  for (const field of ["title", "summary", "why"]) {
    expect(typeof item?.[field]?.es === "string" && item[field].es.trim().length >= 20,
      `${prefix}: falta ${field}.es`);
  }

  const details = item?.homeDetails?.es;
  if (details !== undefined) {
    expect(Array.isArray(details) && details.length === 2,
      `${prefix}: homeDetails.es debe contener dos párrafos cuando existe`);
    for (const paragraph of details || []) {
      expect(typeof paragraph === "string" && paragraph.trim().length >= 90,
        `${prefix}: párrafo de homeDetails demasiado breve`);
      expect(paragraph !== item.summary.es && paragraph !== item.why.es,
        `${prefix}: homeDetails repite el anverso`);
    }
  }

  const emphasis = item?.emphasis?.es;
  expect(Array.isArray(emphasis) && emphasis.length >= 2 && emphasis.length <= 3,
    `${prefix}: emphasis.es debe contener entre dos y tres fragmentos`);

  expect(Array.isArray(item?.sources) && item.sources.length >= 1,
    `${prefix}: faltan fuentes`);
  const itemSourceUrls = new Set();
  for (const source of item?.sources || []) {
    expect(typeof source.label === "string" && source.label.trim(), `${prefix}: fuente sin etiqueta`);
    expect(typeof source.type?.es === "string" && source.type.es.trim(), `${prefix}: fuente sin tipo`);
    expect(/^https:\/\//.test(source.url || ""), `${prefix}: la fuente no usa HTTPS`);
    expect(!itemSourceUrls.has(source.url), `${prefix}: URL de fuente duplicada`);
    itemSourceUrls.add(source.url);
  }

  expect(typeof item.featured === "boolean", `${prefix}: featured debe ser booleano`);
  if (item.featured) featuredCount += 1;
  if (item.important !== undefined) {
    expect(typeof item.important === "boolean", `${prefix}: important debe ser booleano`);
  }
  if (item.article?.url) {
    expect(/^\/noticias\/[a-z0-9-]+$/.test(item.article.url), `${prefix}: URL de artículo inválida`);
  }
}

expect(featuredCount <= 1, "Solo puede existir una noticia featured");
expect(!/\bconst\s+homeDetails\s*=/.test(coreSource), "news-core.js conserva el mapa antiguo homeDetails");
expect(coreSource.includes("item.homeDetails"), "news-core.js no consume item.homeDetails");
expect(!loaderSource.includes("FINALSECRETO_NEWS"), "news.js todavía inyecta noticias fuera de la fuente única");

const version = createHash("sha256").update(dataSource).digest("hex").slice(0, 12);
for (const [name, html] of [["index.html", indexHtml], ["noticias.html", newsHtml]]) {
  expect(html.includes(`js/news-data.js?v=${version}`), `${name}: versión de news-data desactualizada`);
  expect(html.includes(`js/news.js?v=${version}`), `${name}: versión de news.js desactualizada`);
}

if (errors.length) {
  console.error(`Validación de Noticias fallida (${errors.length} problemas):\n`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Noticias válidas: ${news.length}.`);

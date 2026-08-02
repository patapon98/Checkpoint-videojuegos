import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

function loadNews(source) {
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { timeout: 1000 });
  return sandbox.window.FINALSECRETO_NEWS;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function same(left, right) {
  return JSON.stringify(stable(left)) === JSON.stringify(stable(right));
}

const baseSource = execFileSync("git", ["show", "origin/main:js/news-data.js"], { encoding: "utf8" });
const currentSource = await readFile("js/news-data.js", "utf8");
const base = loadNews(baseSource);
const current = loadNews(currentSource);
const errors = [];

const baseById = new Map(base.map((item) => [item.id, item]));
const currentById = new Map(current.map((item) => [item.id, item]));
const additions = current.filter((item) => !baseById.has(item.id));
const removals = base.filter((item) => !currentById.has(item.id));

if (removals.length) errors.push(`No se pueden eliminar noticias: ${removals.map((item) => item.id).join(", ")}`);
if (additions.length < 1 || additions.length > 2) {
  errors.push(`Una PR automática debe añadir una o dos noticias; añade ${additions.length}`);
}

for (const item of base) {
  const next = currentById.get(item.id);
  if (next && !same(item, next)) errors.push(`No se puede reescribir una noticia existente: ${item.id}`);
}

const officialPattern = /(oficial|resultados|informe|documento|comunicado|regulator|registro|presentación corporativa)/i;
const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

for (const item of additions) {
  const published = Date.parse(item.publishedAt || `${item.date}T12:00:00Z`);
  if (!Number.isFinite(published) || published < sevenDaysAgo) {
    errors.push(`${item.id}: la noticia automática no es suficientemente reciente`);
  }
  if (item.featured) errors.push(`${item.id}: una rama automática no puede cambiar la destacada`);
  if (item.article?.url) errors.push(`${item.id}: una rama automática no puede crear artículos individuales`);
  if (!(item.sources || []).some((source) => officialPattern.test(source.type?.es || ""))) {
    errors.push(`${item.id}: falta una fuente primaria u oficial inequívoca`);
  }

  const details = item.homeDetails?.es;
  if (!Array.isArray(details) || details.length !== 2) {
    errors.push(`${item.id}: homeDetails.es debe contener exactamente dos párrafos propios`);
  } else {
    for (const paragraph of details) {
      if (typeof paragraph !== "string" || paragraph.trim().length < 90) {
        errors.push(`${item.id}: los párrafos de homeDetails.es deben aportar contexto suficiente`);
      }
      if (paragraph === item.summary?.es || paragraph === item.why?.es) {
        errors.push(`${item.id}: el reverso no puede repetir summary.es ni why.es`);
      }
    }
  }

  const emphasis = item.emphasis?.es;
  if (!Array.isArray(emphasis) || emphasis.length < 2 || emphasis.length > 3) {
    errors.push(`${item.id}: emphasis.es debe contener entre dos y tres fragmentos`);
  } else {
    const front = `${item.summary?.es || ""}\n${item.why?.es || ""}`;
    for (const phrase of emphasis) {
      if (!front.includes(phrase)) {
        errors.push(`${item.id}: cada énfasis debe coincidir literalmente con summary.es o why.es`);
      }
    }
  }

  if (item.ticker) {
    const keyword = item.ticker.keyword?.es || "";
    const copy = item.ticker.copy?.es || "";
    if (!keyword || !copy.includes(keyword)) {
      errors.push(`${item.id}: ticker.keyword.es debe aparecer literalmente en ticker.copy.es`);
    }
  }
}

if (errors.length) {
  console.error(`Cambio automático de Noticias bloqueado (${errors.length} problemas):\n`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Cambio automático válido: ${additions.map((item) => item.id).join(", ")}.`);

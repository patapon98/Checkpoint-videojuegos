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
}

if (errors.length) {
  console.error(`Cambio automático de Noticias bloqueado (${errors.length} problemas):\n`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Cambio automático válido: ${additions.map((item) => item.id).join(", ")}.`);

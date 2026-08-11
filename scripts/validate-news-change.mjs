import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";

const branch = process.env.GITHUB_HEAD_REF || execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim();
if (!branch.startsWith("bot/news-")) {
  console.log(`La rama ${branch || "sin nombre"} no es una entrega automática de Noticias.`);
  process.exit(0);
}

const changes = execFileSync("git", ["diff", "--name-status", "origin/main...HEAD"], { encoding: "utf8" })
  .trim().split("\n").filter(Boolean);
const additions = [];
const updates = [];
const errors = [];
const newsPathPattern = /^data\/news\/[a-z0-9]+(?:-[a-z0-9]+)*\.json$/;

for (const change of changes) {
  const [status, filename] = change.split("\t");
  if (status === "A" && newsPathPattern.test(filename || "")) additions.push(filename);
  else if (status === "M" && newsPathPattern.test(filename || "")) updates.push(filename);
  else errors.push(`Una PR automática solo puede añadir o actualizar JSON de data/news: ${change}`);
}

if (additions.length && updates.length) {
  errors.push("Una PR automática no puede mezclar noticias nuevas y actualizaciones.");
} else if (additions.length < 1 && updates.length < 1) {
  errors.push("Una PR automática debe añadir una o dos noticias o actualizar exactamente una.");
} else if (additions.length > 2) {
  errors.push(`Una PR automática puede añadir como máximo dos noticias; añade ${additions.length}`);
} else if (updates.length > 1) {
  errors.push(`Una PR automática solo puede actualizar una noticia; actualiza ${updates.length}`);
}

const officialPattern = /(oficial|resultados|informe|documento|comunicado|regulator|registro|presentación corporativa)/i;
const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

function validateCurrent(item, filename, { isAddition = false } = {}) {
  if (filename !== `data/news/${item.id}.json`) errors.push(`${filename}: el nombre debe coincidir con el id`);
  const effectiveDate = item.updated || item.addedAt || item.publishedAt || `${item.date}T00:00:00Z`;
  const effectiveTime = Date.parse(effectiveDate);
  if (!Number.isFinite(effectiveTime) || effectiveTime < sevenDaysAgo) {
    errors.push(`${item.id}: la noticia o actualización no es suficientemente reciente`);
  }
  if (isAddition && item.featured !== false) errors.push(`${item.id}: featured debe ser false`);
  if (isAddition && item.article?.url) errors.push(`${item.id}: una rama automática no puede crear artículos individuales`);
  if (isAddition && !item.addedAt) errors.push(`${item.id}: una noticia nueva debe incluir addedAt`);
  if (item.addedAt !== undefined && !Number.isFinite(Date.parse(item.addedAt))) {
    errors.push(`${item.id}: addedAt debe ser una fecha y hora ISO válida`);
  }
  if (item.versionHistory !== undefined) errors.push(`${item.id}: versionHistory ya no forma parte del esquema`);
  if (!(item.sources || []).some((source) => officialPattern.test(source.type?.es || ""))) {
    errors.push(`${item.id}: falta una fuente primaria u oficial inequívoca`);
  }

  const details = item.homeDetails?.es;
  if (!Array.isArray(details) || details.length !== 2) {
    errors.push(`${item.id}: homeDetails.es debe contener exactamente dos párrafos propios`);
  } else {
    for (const paragraph of details) {
      if (typeof paragraph !== "string" || paragraph.trim().length < 90) errors.push(`${item.id}: homeDetails.es es demasiado breve`);
      if (paragraph === item.summary?.es || paragraph === item.why?.es) errors.push(`${item.id}: el reverso repite el anverso`);
    }
  }

  const emphasis = item.emphasis?.es;
  if (!Array.isArray(emphasis) || emphasis.length < 2 || emphasis.length > 3) {
    errors.push(`${item.id}: emphasis.es debe contener entre dos y tres fragmentos`);
  } else {
    const front = `${item.summary?.es || ""}\n${item.why?.es || ""}`;
    for (const phrase of emphasis) if (!front.includes(phrase)) errors.push(`${item.id}: un énfasis no coincide con el anverso`);
  }

  const keyword = item.ticker?.keyword?.es || "";
  const copy = item.ticker?.copy?.es || "";
  if (!keyword || !copy.includes(keyword)) errors.push(`${item.id}: ticker.keyword.es debe aparecer en ticker.copy.es`);
}

for (const filename of additions) {
  const item = JSON.parse(await readFile(filename, "utf8"));
  validateCurrent(item, filename, { isAddition: true });
  if (item.updated !== undefined) {
    errors.push(`${item.id}: una noticia nueva no puede empezar con updated`);
  }
}

const structuralFields = [
  "id", "date", "publishedAt", "addedAt", "category", "tone", "featured",
  "important", "home", "article", "trailer"
];
const editableFields = ["title", "summary", "why", "homeDetails", "sources", "emphasis", "ticker"];

for (const filename of updates) {
  const item = JSON.parse(await readFile(filename, "utf8"));
  const previous = JSON.parse(execFileSync("git", ["show", `origin/main:${filename}`], { encoding: "utf8" }));
  validateCurrent(item, filename);

  for (const field of structuralFields) {
    if (!isDeepStrictEqual(item[field], previous[field])) {
      errors.push(`${item.id}: una actualización no puede cambiar ${field}`);
    }
  }

  const previousEffectiveDate = previous.updated || previous.date;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.updated || "") || item.updated <= previousEffectiveDate) {
    errors.push(`${item.id}: updated debe avanzar respecto a la versión publicada`);
  }

  if (editableFields.every((field) => isDeepStrictEqual(item[field], previous[field]))) {
    errors.push(`${item.id}: la actualización no modifica ningún contenido editorial visible`);
  }
}

if (errors.length) {
  console.error(`Cambio automático de Noticias bloqueado (${errors.length} problemas):\n`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const ids = [...additions, ...updates].map((file) => file.split("/").pop().replace(/\.json$/, ""));
const mode = updates.length ? "actualización" : "alta";
console.log(`Cambio automático válido (${mode}): ${ids.join(", ")}.`);

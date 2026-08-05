import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";

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

for (const change of changes) {
  const [status, filename] = change.split("\t");
  const isNewsJson = /^data\/news\/[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(filename || "");
  if (status === "A" && isNewsJson) {
    additions.push(filename);
  } else if (status === "M" && isNewsJson) {
    updates.push(filename);
  } else {
    errors.push(`Una PR automática solo puede añadir noticias o actualizar un JSON existente en data/news: ${change}`);
  }
}

const isAdditionDelivery = additions.length >= 1 && additions.length <= 2 && updates.length === 0;
const isUpdateDelivery = additions.length === 0 && updates.length === 1;
if (!isAdditionDelivery && !isUpdateDelivery) {
  errors.push(`Una PR automática debe añadir una o dos noticias o actualizar exactamente una; añade ${additions.length} y actualiza ${updates.length}`);
}

const officialPattern = /(oficial|resultados|informe|documento|comunicado|regulator|registro|presentación corporativa)/i;
const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
const automaticFiles = [...additions, ...updates];

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

for (const filename of automaticFiles) {
  const item = JSON.parse(await readFile(filename, "utf8"));
  const isUpdate = updates.includes(filename);
  if (filename !== `data/news/${item.id}.json`) errors.push(`${filename}: el nombre debe coincidir con el id`);
  const effectiveDate = isUpdate ? item.updated : item.publishedAt || `${item.date}T12:00:00Z`;
  const published = Date.parse(effectiveDate);
  if (!Number.isFinite(published) || published < sevenDaysAgo) errors.push(`${item.id}: la noticia o su actualización no es suficientemente reciente`);
  if (!isUpdate && item.featured !== false) errors.push(`${item.id}: featured debe ser false`);
  if (!isUpdate && item.article?.url) errors.push(`${item.id}: una rama automática no puede crear artículos individuales`);
  if (!(item.sources || []).some((source) => officialPattern.test(source.type?.es || ""))) {
    errors.push(`${item.id}: falta una fuente primaria u oficial inequívoca`);
  }

  if (isUpdate) {
    const before = JSON.parse(execFileSync("git", ["show", `origin/main:${filename}`], { encoding: "utf8" }));
    for (const field of ["id", "date", "publishedAt", "featured", "article", "category", "tone", "important", "home"]) {
      if (!same(item[field], before[field])) errors.push(`${item.id}: una actualización automática no puede cambiar ${field}`);
    }
    const previousEffectiveDate = before.updated || before.date;
    if (typeof item.updated !== "string" || item.updated <= previousEffectiveDate) {
      errors.push(`${item.id}: updated debe avanzar respecto a ${previousEffectiveDate}`);
    }
    const beforeHistory = Array.isArray(before.versionHistory) ? before.versionHistory : [];
    const afterHistory = Array.isArray(item.versionHistory) ? item.versionHistory : [];
    if (afterHistory.length !== beforeHistory.length + 1) {
      errors.push(`${item.id}: versionHistory debe añadir exactamente una instantánea`);
    } else {
      for (let index = 0; index < beforeHistory.length; index += 1) {
        if (!same(afterHistory[index], beforeHistory[index])) {
          errors.push(`${item.id}: no se puede modificar el historial ya publicado`);
          break;
        }
      }
      const expectedSnapshot = {
        date: previousEffectiveDate,
        title: before.title,
        summary: before.summary,
        why: before.why,
        homeDetails: before.homeDetails,
        sources: before.sources
      };
      if (!same(afterHistory.at(-1), expectedSnapshot)) {
        errors.push(`${item.id}: la nueva instantánea no reproduce íntegramente la versión sustituida`);
      }
    }
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

if (errors.length) {
  console.error(`Cambio automático de Noticias bloqueado (${errors.length} problemas):\n`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
const action = isUpdateDelivery ? "actualización" : "alta";
console.log(`Cambio automático válido (${action}): ${automaticFiles.map((file) => file.split("/").pop().replace(/\.json$/, "")).join(", ")}.`);

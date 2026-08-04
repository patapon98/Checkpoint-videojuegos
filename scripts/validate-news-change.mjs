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
const errors = [];

for (const change of changes) {
  const [status, filename] = change.split("\t");
  if (status === "A" && /^data\/news\/[a-z0-9]+(?:-[a-z0-9]+)*\.json$/.test(filename || "")) {
    additions.push(filename);
  } else {
    errors.push(`Una PR automática solo puede añadir JSON nuevos en data/news: ${change}`);
  }
}

if (additions.length < 1 || additions.length > 2) {
  errors.push(`Una PR automática debe añadir una o dos noticias; añade ${additions.length}`);
}

const officialPattern = /(oficial|resultados|informe|documento|comunicado|regulator|registro|presentación corporativa)/i;
const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
for (const filename of additions) {
  const item = JSON.parse(await readFile(filename, "utf8"));
  if (filename !== `data/news/${item.id}.json`) errors.push(`${filename}: el nombre debe coincidir con el id`);
  const published = Date.parse(item.publishedAt || `${item.date}T12:00:00Z`);
  if (!Number.isFinite(published) || published < sevenDaysAgo) errors.push(`${item.id}: la noticia no es suficientemente reciente`);
  if (item.featured !== false) errors.push(`${item.id}: featured debe ser false`);
  if (item.article?.url) errors.push(`${item.id}: una rama automática no puede crear artículos individuales`);
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

if (errors.length) {
  console.error(`Cambio automático de Noticias bloqueado (${errors.length} problemas):\n`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Cambio automático válido: ${additions.map((file) => file.split("/").pop().replace(/\.json$/, "")).join(", ")}.`);


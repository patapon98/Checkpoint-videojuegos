import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { isThirdPartyImage, sourceHost, stripHtml, todayMadrid } from "./calendar-utils.mjs";

const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, "data", "calendar.json");
const current = JSON.parse(await readFile(DATA_FILE, "utf8"));
const TODAY = process.env.CALENDAR_TODAY || todayMadrid();

let base;
try {
  base = JSON.parse(execFileSync("git", ["show", "origin/main:data/calendar.json"], { cwd: ROOT, encoding: "utf8" }));
} catch {
  console.log("main todavía no contiene data/calendar.json. Se omite la comparación editorial inicial.");
  process.exit(0);
}

const baseById = new Map(base.releases.map((release) => [release.id, release]));
const currentById = new Map(current.releases.map((release) => [release.id, release]));
const errors = [];
const warnings = [];
const MATERIAL_FIELDS = ["title", "date", "platformKeys", "platformsHtml", "image", "store", "trailer", "tag", "badge", "priority"];

function normalized(value = "") {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function isRawgImage(image = {}) {
  const host = sourceHost(image.src || "");
  return image.provider === "rawg"
    && Number(image.rawgId) > 0
    && Boolean(image.rawgSlug)
    && /^https:\/\/rawg\.io\/games\//.test(image.rawgPage || "")
    && (host === "media.rawg.io" || host.endsWith(".rawg.io"));
}

function isSelfHostedImage(image = {}) {
  const host = sourceHost(image.src || "");
  return host === "finalsecreto.com" || host === "www.finalsecreto.com";
}

function changedFields(before, after) {
  if (!before) return [...MATERIAL_FIELDS];
  return MATERIAL_FIELDS.filter((field) => JSON.stringify(before[field] ?? null) !== JSON.stringify(after[field] ?? null));
}

function materiallyChanged(before, after) {
  return changedFields(before, after).length > 0;
}

async function fetchChecked(url, label, { required = true } = {}) {
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: {
        "user-agent": "FinalSecreto-CalendarValidator/1.0",
        "accept-language": "es-ES,es;q=0.9,en;q=0.7"
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response;
  } catch (error) {
    const message = `${label} no responde correctamente: ${error.message}`;
    if (required) errors.push(message);
    else warnings.push(message);
    return null;
  }
}

const changed = current.releases.filter((release) => materiallyChanged(baseById.get(release.id), release));
const removed = base.releases.filter((release) => !currentById.has(release.id));
for (const release of removed) errors.push(`${release.id}: no se permite eliminar una entrada automáticamente. Debe conservarse como histórica o documentarse manualmente.`);

for (const release of changed) {
  const prefix = release.id || release.title || "Entrada sin identificar";
  const before = baseById.get(release.id);
  const fields = changedFields(before, release);
  const imageOnly = Boolean(before) && fields.length === 1 && fields[0] === "image" && (isRawgImage(release.image) || isSelfHostedImage(release.image));
  const source = release.source || {};
  const evidence = source.evidence || {};

  if (!imageOnly) {
    if (release.legacy) errors.push(`${prefix}: un alta o cambio editorial automático no puede marcarse como heredado.`);
    if (!source.official) errors.push(`${prefix}: la fuente de fecha y plataformas debe declararse oficial.`);
    if (!/^https:\/\//.test(source.url || "")) errors.push(`${prefix}: falta la URL oficial HTTPS.`);
    if (!/^20\d{2}-\d{2}-\d{2}$/.test(source.checkedAt || "")) errors.push(`${prefix}: falta source.checkedAt en ISO.`);
    if (source.checkedAt && Math.abs((new Date(`${TODAY}T00:00:00Z`) - new Date(`${source.checkedAt}T00:00:00Z`)) / 864e5) > 14) {
      errors.push(`${prefix}: la verificación oficial tiene más de 14 días.`);
    }
    if (evidence.releaseDate !== release.date) errors.push(`${prefix}: source.evidence.releaseDate debe coincidir con ${release.date}.`);
    const evidencedPlatforms = new Set(evidence.platforms || []);
    for (const platform of release.platformKeys || []) {
      if (!evidencedPlatforms.has(platform)) errors.push(`${prefix}: la evidencia no confirma la plataforma «${platform}».`);
    }
    if (!evidence.title || normalized(evidence.title) !== normalized(release.title)) errors.push(`${prefix}: la evidencia no identifica exactamente el título.`);
  }

  if (isThirdPartyImage(release.image?.src) && !isRawgImage(release.image)) {
    errors.push(`${prefix}: una imagen externa nueva solo puede proceder de RAWG con rawgId, rawgSlug y rawgPage; YouTube y otros agregadores no están permitidos.`);
  }
  if (release.image?.provider === "rawg" && !isRawgImage(release.image)) {
    errors.push(`${prefix}: los metadatos RAWG de la imagen están incompletos o no corresponden a media.rawg.io.`);
  }
  if (!/^https:\/\//.test(release.image?.src || "")) errors.push(`${prefix}: falta una imagen HTTPS.`);
  if (!imageOnly && !/^https:\/\//.test(release.store?.url || "")) errors.push(`${prefix}: falta una ficha oficial o tienda válida.`);

  if (!imageOnly) {
    const sourceResponse = source.url ? await fetchChecked(source.url, `${prefix}: fuente oficial`) : null;
    if (sourceResponse) {
      const type = sourceResponse.headers.get("content-type") || "";
      if (type.includes("text/html")) {
        const text = normalized(stripHtml(await sourceResponse.text()));
        const importantTokens = normalized(release.title).split(/\s+/).filter((token) => token.length > 3).slice(0, 4);
        const matches = importantTokens.filter((token) => text.includes(token)).length;
        if (importantTokens.length && matches < Math.min(2, importantTokens.length)) {
          errors.push(`${prefix}: la página oficial no parece corresponder inequívocamente al título.`);
        }
      }
    }
  }
  if (release.image?.src) await fetchChecked(release.image.src, `${prefix}: imagen`, { required: false });
  if (release.image?.rawgPage) await fetchChecked(release.image.rawgPage, `${prefix}: atribución RAWG`);
  if (!imageOnly && release.store?.url && release.store.url !== source.url) await fetchChecked(release.store.url, `${prefix}: ficha de tienda`);
}

for (const warning of warnings) console.warn(`ADVERTENCIA: ${warning}`);
if (errors.length) {
  console.error(errors.map((error) => `ERROR: ${error}`).join("\n"));
  process.exit(1);
}
console.log(`Validados ${changed.length} cambios editoriales frente a main. ${warnings.length} advertencias de disponibilidad de imagen.`);

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  isThirdPartyImage,
  releaseStateHash,
  sourceHost,
  stripHtml,
  todayMadrid
} from "./calendar-utils.mjs";

const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, "data", "calendar.json");
const TODAY = process.env.CALENDAR_TODAY || todayMadrid();
const data = JSON.parse(await readFile(DATA_FILE, "utf8"));
const changes = [];

function normalize(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent": "FinalSecreto-CalendarUpdater/1.0",
      "accept-language": "es-ES,es;q=0.9,en;q=0.7"
    },
    ...options
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

function findReleaseDates(value, output = []) {
  if (!value) return output;
  if (Array.isArray(value)) {
    value.forEach((item) => findReleaseDates(item, output));
    return output;
  }
  if (typeof value !== "object") return output;
  for (const [key, item] of Object.entries(value)) {
    if (key.toLowerCase() === "releasedate" && typeof item === "string") output.push(item);
    else findReleaseDates(item, output);
  }
  return output;
}

function isoDate(value) {
  const match = /^(20\d{2})-(\d{2})-(\d{2})/.exec(String(value || "").trim());
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

function dateFromOfficialHtml(html) {
  const candidates = [];
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { findReleaseDates(JSON.parse(match[1].trim()), candidates); }
    catch { /* JSON-LD defectuoso: se ignora */ }
  }
  for (const match of html.matchAll(/<meta\b[^>]*(?:itemprop=["']releaseDate["']|property=["'](?:product:release_date|og:release_date)["'])[^>]*>/gi)) {
    const content = /\bcontent=["']([^"']+)["']/i.exec(match[0])?.[1];
    if (content) candidates.push(content);
  }
  const exact = [...new Set(candidates.map(isoDate).filter(Boolean))];
  return exact.length === 1 ? exact[0] : null;
}

async function updateImageFromSteam(release, appId) {
  const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=english&cc=es`, {
    headers: { "user-agent": "FinalSecreto-CalendarUpdater/1.0" }
  });
  if (!response.ok) throw new Error(`Steam API HTTP ${response.status}`);
  const payload = await response.json();
  const official = payload?.[appId]?.data;
  if (!official) throw new Error("Steam no devolvió una ficha válida");
  if (!official.header_image || !isThirdPartyImage(release.image?.src)) return;

  const expected = normalize(release.image?.alt || release.title);
  const received = normalize(official.name);
  if (expected !== received) throw new Error(`la imagen parece corresponder a «${official.name}»`);
  changes.push(`${release.title}: imagen heredada sustituida por Steam`);
  release.image.src = official.header_image;
  release.image.alt = official.name;
  release.image.className = "";
  release.image.legacy = false;
}

async function verifyOfficialPage(release) {
  if (!release.source?.official || !release.source.url) return;
  const html = await fetchText(release.source.url);
  const visibleText = normalize(stripHtml(html));
  const keyTokens = normalize(release.title).split(/\s+/).filter((token) => token.length > 3).slice(0, 3);
  if (keyTokens.length && keyTokens.filter((token) => visibleText.includes(token)).length < Math.min(2, keyTokens.length)) {
    throw new Error("el título no aparece de forma inequívoca en la página");
  }

  // Las fechas se interpretan como fechas civiles de España peninsular. Nunca se
  // derivan de timestamps UTC ni de la fecha de otra edición o región en Steam.
  if (release.source.autoDateUpdate !== true) return;
  const date = dateFromOfficialHtml(html);
  if (date && date !== release.date) {
    changes.push(`${release.title}: ${release.date} → ${date} según ${sourceHost(release.source.url)}`);
    release.date = date;
  }
}

for (const release of data.releases) {
  if (release.source?.autoUpdate === false) continue;
  try {
    if (release.source?.official && release.source?.url) await verifyOfficialPage(release);

    // Steam solo se consulta cuando una entrada autoriza expresamente sustituir
    // su imagen. Nunca se consulta para cambiar fechas.
    if (release.source?.autoImageUpdate === true) {
      const steamUrl = release.store?.url || "";
      const appId = /store\.steampowered\.com\/app\/(\d+)/i.exec(steamUrl)?.[1];
      if (appId) await updateImageFromSteam(release, appId);
    }
  } catch (error) {
    console.warn(`No se pudo verificar ${release.title}: ${error.message}`);
  }
}

const nextState = releaseStateHash(data, TODAY);
if (changes.length || nextState !== data.renderState) {
  data.updatedAt = TODAY;
  data.renderState = nextState;
  data.releases.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title, "es"));
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(changes.length ? changes.join("\n") : "Ha cambiado el estado temporal del calendario.");
} else {
  console.log("No hay cambios verificables en el calendario.");
}

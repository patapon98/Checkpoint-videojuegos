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

const MONTHS = new Map([
  ["jan", 1], ["january", 1], ["ene", 1], ["enero", 1],
  ["feb", 2], ["february", 2], ["febrero", 2],
  ["mar", 3], ["march", 3], ["marzo", 3],
  ["apr", 4], ["april", 4], ["abr", 4], ["abril", 4],
  ["may", 5], ["mayo", 5],
  ["jun", 6], ["june", 6], ["junio", 6],
  ["jul", 7], ["july", 7], ["julio", 7],
  ["aug", 8], ["august", 8], ["ago", 8], ["agosto", 8],
  ["sep", 9], ["sept", 9], ["september", 9], ["septiembre", 9],
  ["oct", 10], ["october", 10], ["octubre", 10],
  ["nov", 11], ["november", 11], ["noviembre", 11],
  ["dec", 12], ["december", 12], ["dic", 12], ["diciembre", 12]
]);

function isoDate(value) {
  const text = String(value || "").trim().replace(/\.$/, "");
  const direct = /^(20\d{2})-(\d{2})-(\d{2})$/.exec(text);
  if (direct) return text;
  const patterns = [
    /^(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóú]+),?\s+(20\d{2})$/,
    /^([A-Za-zÁÉÍÓÚáéíóú]+)\s+(\d{1,2}),?\s+(20\d{2})$/
  ];
  for (const [index, pattern] of patterns.entries()) {
    const match = pattern.exec(text);
    if (!match) continue;
    const day = Number(index === 0 ? match[1] : match[2]);
    const monthName = (index === 0 ? match[2] : match[1]).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const year = Number(match[3]);
    const month = MONTHS.get(monthName) || MONTHS.get(monthName.slice(0, 3));
    if (!month || day < 1 || day > 31) continue;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  return null;
}

function normalize(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function titleSimilarity(left, right) {
  const a = new Set(normalize(left).split(/\s+/).filter((token) => token.length > 1));
  const b = new Set(normalize(right).split(/\s+/).filter((token) => token.length > 1));
  if (!a.size || !b.size) return 0;
  const overlap = [...a].filter((token) => b.has(token)).length;
  return overlap / Math.min(a.size, b.size);
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

async function updateFromSteam(release, appId) {
  const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=english&cc=es`, {
    headers: { "user-agent": "FinalSecreto-CalendarUpdater/1.0" }
  });
  if (!response.ok) throw new Error(`Steam API HTTP ${response.status}`);
  const payload = await response.json();
  const record = payload?.[appId];
  if (!record?.success || !record.data) throw new Error("Steam no devolvió una ficha válida");
  const official = record.data;
  const referenceTitle = release.image?.alt || release.title;
  if (titleSimilarity(referenceTitle, official.name) < 0.55) {
    throw new Error(`la ficha parece corresponder a «${official.name}»`);
  }

  const date = isoDate(official.release_date?.date);
  if (date && date !== release.date) {
    changes.push(`${release.title}: ${release.date} → ${date} según Steam`);
    release.date = date;
  }

  if (official.header_image && isThirdPartyImage(release.image?.src)) {
    changes.push(`${release.title}: imagen de terceros sustituida por Steam`);
    release.image.src = official.header_image;
    release.image.alt = official.name || release.title;
    release.image.className = "";
    release.image.legacy = false;
  }

  release.source = {
    ...(release.source || {}),
    url: release.store?.url || release.source?.url,
    official: true,
    host: "store.steampowered.com",
    checkedAt: TODAY,
    method: "steam-appdetails"
  };
}

async function updateFromOfficialPage(release) {
  if (!release.source?.official || !release.source.url) return;
  const html = await fetchText(release.source.url);
  const visibleText = normalize(stripHtml(html));
  const reference = normalize(release.title);
  const keyTokens = reference.split(/\s+/).filter((token) => token.length > 3).slice(0, 3);
  if (keyTokens.length && keyTokens.filter((token) => visibleText.includes(token)).length < Math.min(2, keyTokens.length)) {
    throw new Error("el título no aparece de forma inequívoca en la página");
  }
  const date = dateFromOfficialHtml(html);
  if (date && date !== release.date) {
    changes.push(`${release.title}: ${release.date} → ${date} según ${sourceHost(release.source.url)}`);
    release.date = date;
  }
  release.source.checkedAt = TODAY;
  release.source.method = date ? "official-jsonld" : "official-page-checked";
}

for (const release of data.releases) {
  if (release.source?.autoUpdate === false) continue;
  const steamUrl = release.store?.url || release.source?.url || "";
  const appId = /store\.steampowered\.com\/app\/(\d+)/i.exec(steamUrl)?.[1];
  try {
    if (appId) await updateFromSteam(release, appId);
    else await updateFromOfficialPage(release);
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

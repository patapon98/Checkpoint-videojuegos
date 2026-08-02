import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { todayMadrid } from "./calendar-utils.mjs";
import { isRawgProvider, isResolvedRawgImage, resolveRawgImage } from "./rawg-images.mjs";

const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, "data", "calendar.json");
const REQUESTS_FILE = path.join(ROOT, "data", "rawg-image-requests.json");
const API_KEY = String(process.env.RAWG_API_KEY || "").trim();
const TODAY = process.env.CALENDAR_TODAY || todayMadrid();
const data = JSON.parse(await readFile(DATA_FILE, "utf8"));
const costOfHope = data.releases.find((release) => release.id === "stalker-2-cost-of-hope");
if (costOfHope && !isResolvedRawgImage(costOfHope.image)) {
  costOfHope.image = {
    ...(costOfHope.image || {}),
    provider: "rawg",
    query: "S.T.A.L.K.E.R. 2: Cost of Hope",
    src: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3765020/518ac9999d93e450764a3d85b148c47cc80fffb7/header.jpg?t=1785157413",
    alt: "S.T.A.L.K.E.R. 2: Cost of Hope",
    className: "",
    gridArt: "",
    poster: "",
    legacy: false
  };
}
const originalImages = new Map(data.releases.map((release) => [release.id, structuredClone(release.image || {})]));

let requestData = { requests: [] };
try {
  requestData = JSON.parse(await readFile(REQUESTS_FILE, "utf8"));
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

for (const request of requestData.requests || []) {
  const release = data.releases.find((item) => item.id === request.id);
  if (!release) throw new Error(`La solicitud RAWG hace referencia a un ID inexistente: ${request.id}`);
  const query = request.query || release.title;
  const changedRequest = release.image?.provider !== "rawg"
    || release.image?.query !== query
    || (request.rawgId && Number(release.image?.rawgId) !== Number(request.rawgId));
  if (!changedRequest && isResolvedRawgImage(release.image)) continue;

  release.image = {
    ...(release.image || {}),
    provider: "rawg",
    query
  };
  if (request.rawgId) release.image.rawgId = Number(request.rawgId);
  else if (changedRequest) {
    delete release.image.rawgId;
    delete release.image.rawgSlug;
    delete release.image.rawgPage;
    delete release.image.rawgImageType;
  }
}

const pending = data.releases.filter((release) => isRawgProvider(release.image) && !isResolvedRawgImage(release.image));
if (!pending.length) {
  console.log("No hay imágenes del calendario pendientes de RAWG.");
  process.exit(0);
}

if (!API_KEY) {
  console.error("ERROR: hay imágenes pendientes de RAWG, pero no se ha proporcionado una clave temporal ni el secreto RAWG_API_KEY.");
  process.exit(1);
}

const changes = [];
const errors = [];
const warnings = [];
for (const release of pending) {
  try {
    if (await resolveRawgImage(release, { apiKey: API_KEY })) changes.push(release.title);
  } catch (error) {
    if (/RAWG no ofrece imagen principal ni capturas HTTPS/.test(error.message)) {
      release.image = structuredClone(originalImages.get(release.id) || {});
      warnings.push(`${release.title}: RAWG identifica la ficha, pero todavía no ofrece imágenes; se conserva la anterior`);
      continue;
    }
    errors.push(`${release.id || release.title}: ${error.message}`);
  }
}

for (const warning of warnings) console.warn(`ADVERTENCIA: ${warning}`);
if (errors.length) {
  console.error(errors.map((error) => `ERROR: ${error}`).join("\n"));
  process.exit(1);
}

if (!changes.length) {
  console.log(`RAWG comprobado para ${pending.length} imágenes; no hay sustituciones disponibles.`);
  process.exit(0);
}

data.updatedAt = TODAY;
await writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`RAWG actualizó ${changes.length} imágenes: ${changes.join(", ")}.`);

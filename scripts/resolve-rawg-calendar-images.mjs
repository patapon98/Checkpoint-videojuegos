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
const automaticRelease = {
  id: "stalker-2-cost-of-hope",
  title: "S.T.A.L.K.E.R. 2: Cost of Hope",
  headingHtml: "S.T.A.L.K.E.R. 2: Cost of Hope <span class=\"tag-dlc\">Expansión</span>",
  date: "2026-08-20",
  platformKeys: ["ps5", "xbox", "pc"],
  platformsHtml: "PS5 · Xbox Series X|S · PC",
  image: {
    src: "https://store-images.s-microsoft.com/image/apps.29646.13887327924862132.3b59ae26-3ba7-42d2-88e8-d98dcc9eef30.bce48abc-aa68-451f-bfa9-23b90451519b?q=90&w=480&h=270",
    alt: "S.T.A.L.K.E.R. 2: Cost of Hope",
    className: "",
    gridArt: "",
    poster: "",
    legacy: false
  },
  store: {
    url: "https://store.steampowered.com/app/3765020/STALKER_2_Cost_of_Hope/",
    title: "Wishlist en Steam",
    ariaLabel: "Añadir S.T.A.L.K.E.R. 2: Cost of Hope a la lista de deseados en Steam"
  },
  affiliate: null,
  review: null,
  tag: "Expansión",
  badge: null,
  priority: 55,
  source: {
    url: "https://www.stalker2.com/news/coh-date-reveal",
    official: true,
    host: "www.stalker2.com",
    checkedAt: "2026-08-03",
    evidence: {
      title: "S.T.A.L.K.E.R. 2: Cost of Hope",
      releaseDate: "2026-08-20",
      platforms: ["ps5", "xbox", "pc"]
    }
  },
  legacy: false,
  trailer: "https://www.youtube.com/watch?v=P72ce_8vnwA"
};
let insertedAutomaticRelease = false;
if (!data.releases.some((release) => release.id === automaticRelease.id)) {
  data.releases.push(automaticRelease);
  data.releases.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title, "es"));
  data.updatedAt = TODAY;
  insertedAutomaticRelease = true;
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
  if (insertedAutomaticRelease) {
    await writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
    console.log(`Se añadió ${automaticRelease.title} con una imagen oficial de Microsoft Store.`);
  } else {
    console.log("No hay imágenes del calendario pendientes de RAWG.");
  }
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

if (!changes.length && !insertedAutomaticRelease) {
  console.log(`RAWG comprobado para ${pending.length} imágenes; no hay sustituciones disponibles.`);
  process.exit(0);
}

data.updatedAt = TODAY;
await writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(changes.length
  ? `RAWG actualizó ${changes.length} imágenes: ${changes.join(", ")}.`
  : `Se añadió ${automaticRelease.title} con una imagen oficial de Microsoft Store.`);

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { todayMadrid } from "./calendar-utils.mjs";
import { isRawgProvider, resolveRawgImage } from "./rawg-images.mjs";

const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, "data", "calendar.json");
const API_KEY = String(process.env.RAWG_API_KEY || "").trim();
const TODAY = process.env.CALENDAR_TODAY || todayMadrid();
const data = JSON.parse(await readFile(DATA_FILE, "utf8"));
const requested = data.releases.filter((release) => isRawgProvider(release.image));

if (!requested.length) {
  console.log("No hay imágenes del calendario pendientes de RAWG.");
  process.exit(0);
}

if (!API_KEY) {
  console.error("ERROR: hay imágenes configuradas con provider=rawg, pero falta el secreto RAWG_API_KEY.");
  process.exit(1);
}

const changes = [];
const errors = [];
for (const release of requested) {
  try {
    if (await resolveRawgImage(release, { apiKey: API_KEY })) changes.push(release.title);
  } catch (error) {
    errors.push(`${release.id || release.title}: ${error.message}`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `ERROR: ${error}`).join("\n"));
  process.exit(1);
}

if (!changes.length) {
  console.log(`RAWG comprobado para ${requested.length} imágenes; no hay cambios.`);
  process.exit(0);
}

data.updatedAt = TODAY;
await writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`RAWG actualizó ${changes.length} imágenes: ${changes.join(", ")}.`);

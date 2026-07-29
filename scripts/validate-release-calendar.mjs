import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  elementById,
  isThirdPartyImage,
  monthKey,
  selectHomeReleases,
  sourceHost,
  todayMadrid,
  topLevelDivs,
  attributes
} from "./calendar-utils.mjs";

const ROOT = process.cwd();
const TODAY = process.env.CALENDAR_TODAY || todayMadrid();
const data = JSON.parse(await readFile(path.join(ROOT, "data", "calendar.json"), "utf8"));
const calendarHtml = await readFile(path.join(ROOT, "calendario.html"), "utf8");
const homeHtml = await readFile(path.join(ROOT, "index.html"), "utf8");
const errors = [];
const warnings = [];

const fail = (message) => errors.push(message);
const warn = (message) => warnings.push(message);

if (!/^20\d{2}-\d{2}-\d{2}$/.test(data.updatedAt || "")) fail("updatedAt no es una fecha ISO.");
if (!Array.isArray(data.releases) || !data.releases.length) fail("No hay lanzamientos en data/calendar.json.");

const ids = new Set();
const allowedPlatforms = new Set(data.settings?.allowedPlatforms || []);
for (const release of data.releases || []) {
  if (!release.id) fail(`Un lanzamiento no tiene id: ${release.title || "sin título"}.`);
  else if (ids.has(release.id)) fail(`ID duplicado: ${release.id}.`);
  else ids.add(release.id);

  if (!release.title?.trim()) fail(`${release.id}: falta el título.`);
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(release.date || "")) fail(`${release.id}: la fecha no es exacta o no usa ISO.`);
  if (!Array.isArray(release.platformKeys) || !release.platformKeys.length) fail(`${release.id}: faltan plataformas.`);
  for (const platform of release.platformKeys || []) {
    if (!allowedPlatforms.has(platform)) fail(`${release.id}: plataforma desconocida «${platform}».`);
  }
  if (!release.platformsHtml?.trim()) fail(`${release.id}: falta el texto visible de plataformas.`);
  if (!release.image?.src || !/^https:\/\//.test(release.image.src)) fail(`${release.id}: falta una imagen HTTPS.`);
  if (!release.image?.alt?.trim()) fail(`${release.id}: falta el texto alternativo.`);
  if (!release.store?.url || !/^https:\/\//.test(release.store.url)) warn(`${release.id}: no tiene enlace de tienda o ficha oficial.`);

  if (!release.legacy) {
    if (!release.source?.official) fail(`${release.id}: una entrada nueva debe estar verificada en una fuente oficial.`);
    if (!release.source?.url || !/^https:\/\//.test(release.source.url)) fail(`${release.id}: falta la URL oficial de verificación.`);
    if (isThirdPartyImage(release.image.src)) fail(`${release.id}: una entrada nueva no puede usar RAWG, YouTube u otro agregador como imagen.`);
  } else {
    if (isThirdPartyImage(release.image?.src)) warn(`${release.id}: conserva una imagen heredada de terceros pendiente de sustitución automática.`);
  }
}

for (let index = 1; index < (data.releases || []).length; index += 1) {
  const previous = data.releases[index - 1];
  const current = data.releases[index];
  if (previous.date > current.date) fail(`El JSON no está ordenado: ${previous.title} aparece antes que ${current.title}.`);
}

const calendarRoot = elementById(calendarHtml, "releases");
const renderedIds = [];
let currentMonth = "";
for (const block of topLevelDivs(calendarRoot.inner)) {
  const attrs = attributes(block.openTag);
  const classes = String(attrs.class || "").split(/\s+/);
  if (classes.includes("month-label")) currentMonth = attrs["data-month"] || "";
  if (!classes.includes("release")) continue;
  if (!classes.includes("reveal")) fail(`${attrs["data-release-id"] || "Una ficha"} no tiene la clase reveal.`);
  if (!attrs["data-release-id"]) fail("Una ficha renderizada no declara data-release-id.");
  else renderedIds.push(attrs["data-release-id"]);
  if (!attrs["data-release-date"]) fail(`${attrs["data-release-id"]}: falta data-release-date.`);
  if (currentMonth && monthKey(attrs["data-release-date"] || "") !== currentMonth) fail(`${attrs["data-release-id"]}: está en un mes incorrecto.`);
}

const visibleIds = new Set(renderedIds);
for (const release of data.releases) {
  const releaseMonth = monthKey(release.date);
  const currentMonthKey = monthKey(TODAY);
  const archiveFloorDate = new Date(`${currentMonthKey}-01T00:00:00Z`);
  archiveFloorDate.setUTCMonth(archiveFloorDate.getUTCMonth() - (data.settings?.archiveMonths ?? 1));
  const archiveFloor = `${archiveFloorDate.getUTCFullYear()}-${String(archiveFloorDate.getUTCMonth() + 1).padStart(2, "0")}`;
  if (releaseMonth >= archiveFloor && !visibleIds.has(release.id)) fail(`${release.id}: debería aparecer en el calendario generado.`);
}

const homeIds = selectHomeReleases(data, TODAY).map((release) => release.id);
for (const id of homeIds) {
  if (!homeHtml.includes(`data-release-id="${id}"`)) fail(`${id}: falta en el calendario de portada.`);
}
if ((homeHtml.match(/data-release-id=/g) || []).length < homeIds.length) fail("La portada contiene menos fichas de las previstas.");

const calendarCountdown = /class="countdown reveal"[^>]*data-countdown-date="(20\d{2}-\d{2}-\d{2})"/.exec(calendarHtml)?.[1];
const homeCountdown = /class="countdown"[^>]*data-countdown-date="(20\d{2}-\d{2}-\d{2})"/.exec(homeHtml)?.[1];
if (!calendarCountdown || !homeCountdown) fail("La cuenta atrás no declara una fecha estructurada.");
if (calendarCountdown !== homeCountdown) fail("La cuenta atrás no está sincronizada entre portada y calendario.");

const monthOptions = [...calendarHtml.matchAll(/<option value="(20\d{2}-\d{2})">/g)].map((match) => match[1]);
const uniqueOptions = new Set(monthOptions);
if (uniqueOptions.size !== monthOptions.length) fail("El selector mensual contiene meses duplicados.");

for (const warning of warnings) console.warn(`ADVERTENCIA: ${warning}`);
if (errors.length) {
  console.error(errors.map((error) => `ERROR: ${error}`).join("\n"));
  process.exit(1);
}
console.log(`Checklist automática superada para ${data.releases.length} lanzamientos. ${warnings.length} advertencias heredadas.`);

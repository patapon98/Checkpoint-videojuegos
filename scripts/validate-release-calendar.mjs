import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  elementById,
  isThirdPartyImage,
  monthKey,
  selectHomeReleases,
  sourceHost,
  sortPlatformKeys,
  sortPlatformsHtml,
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

function isRawgHost(url = "") {
  const host = sourceHost(url);
  return host === "media.rawg.io" || host.endsWith(".rawg.io");
}

function validRawgImage(image = {}) {
  return image.provider === "rawg"
    && Number(image.rawgId) > 0
    && Boolean(image.rawgSlug)
    && /^https:\/\/rawg\.io\/games\//.test(image.rawgPage || "")
    && isRawgHost(image.src);
}

function requireRawgAttribution(html, label) {
  if (!/(?:https?:)?\/\/media\.rawg\.io\//.test(html)) return;
  if (!/class="rawg-attribution"/.test(html) || !/href="https:\/\/rawg\.io\/?"/.test(html)) {
    fail(`${label}: usa imágenes de RAWG pero no incluye la atribución enlazada obligatoria.`);
  }
}

if (!/^20\d{2}-\d{2}-\d{2}$/.test(data.updatedAt || "")) fail("updatedAt no es una fecha ISO.");
if (!Array.isArray(data.releases) || !data.releases.length) fail("No hay lanzamientos en data/calendar.json.");

const ids = new Set();
const allowedPlatforms = new Set(data.settings?.allowedPlatforms || []);
const requiredPlatformOrder = ["ps5", "ps4", "xbox", "pc", "switch"];
const platformOrder = data.settings?.platformOrder;
if (JSON.stringify(platformOrder) !== JSON.stringify(requiredPlatformOrder)) {
  fail("settings.platformOrder debe mantener la prioridad PS5, PS4, Xbox, PC y Switch.");
}
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
  const orderedPlatformKeys = sortPlatformKeys(release.platformKeys || [], platformOrder);
  if (JSON.stringify(release.platformKeys || []) !== JSON.stringify(orderedPlatformKeys)) {
    fail(`${release.id}: platformKeys debe seguir la prioridad PS5, PS4, Xbox, PC y Switch.`);
  }
  if (!release.platformsHtml?.trim()) fail(`${release.id}: falta el texto visible de plataformas.`);
  const orderedPlatformsHtml = sortPlatformsHtml(release.platformsHtml || "", platformOrder);
  if ((release.platformsHtml || "") !== orderedPlatformsHtml) {
    fail(`${release.id}: el texto visible de plataformas debe seguir la prioridad PS5, PS4, Xbox, PC y Switch.`);
  }
  if (!release.image?.src || !/^https:\/\//.test(release.image.src)) fail(`${release.id}: falta una imagen HTTPS.`);
  if (!release.image?.alt?.trim()) fail(`${release.id}: falta el texto alternativo.`);
  if (!release.store?.url || !/^https:\/\//.test(release.store.url)) warn(`${release.id}: no tiene enlace de tienda o ficha oficial.`);

  if (release.image?.provider === "rawg" && !validRawgImage(release.image)) {
    fail(`${release.id}: una imagen RAWG debe declarar rawgId, rawgSlug, rawgPage y una URL de media.rawg.io.`);
  }

  if (!release.legacy) {
    if (!release.source?.official) fail(`${release.id}: una entrada nueva debe estar verificada en una fuente oficial.`);
    if (!release.source?.url || !/^https:\/\//.test(release.source.url)) fail(`${release.id}: falta la URL oficial de verificación.`);
    if (isThirdPartyImage(release.image.src) && !validRawgImage(release.image)) {
      fail(`${release.id}: una imagen externa nueva solo puede proceder de RAWG con metadatos completos; YouTube y otros agregadores no están permitidos.`);
    }
  } else if (isThirdPartyImage(release.image?.src)) {
    warn(`${release.id}: conserva una imagen heredada de terceros pendiente de normalización.`);
  }
}

for (let index = 1; index < (data.releases || []).length; index += 1) {
  const previous = data.releases[index - 1];
  const current = data.releases[index];
  if (previous.date > current.date) fail(`El JSON no está ordenado: ${previous.title} aparece antes que ${current.title}.`);
}

const releasesById = new Map(data.releases.map((release) => [release.id, release]));
const calendarRoot = elementById(calendarHtml, "releases");
const renderedIds = [];
let currentMonth = "";
for (const block of topLevelDivs(calendarRoot.inner)) {
  const attrs = attributes(block.openTag);
  const classes = String(attrs.class || "").split(/\s+/);
  if (classes.includes("month-label")) currentMonth = attrs["data-month"] || "";
  if (!classes.includes("release")) continue;

  const id = attrs["data-release-id"] || "";
  const release = releasesById.get(id);
  const date = attrs["data-release-date"] || "";
  if (!classes.includes("reveal")) fail(`${id || "Una ficha"} no tiene la clase reveal.`);
  if (!id) fail("Una ficha renderizada no declara data-release-id.");
  else renderedIds.push(id);
  if (!date) fail(`${id}: falta data-release-date.`);
  if (currentMonth && monthKey(date) !== currentMonth) fail(`${id}: está en un mes incorrecto.`);

  const expectedState = date === TODAY ? "today" : (date < TODAY ? "available" : "upcoming");
  if (attrs["data-release-state"] !== expectedState) fail(`${id}: data-release-state no coincide con la fecha en Europe/Madrid.`);
  if (date === TODAY) {
    if (!classes.includes("release-today")) fail(`${id}: un lanzamiento de hoy debe llevar release-today.`);
    if (!/class="[^"]*\bhype-today\b[^"]*"[^>]*>Sale hoy<\/span>/.test(block.outer)) fail(`${id}: falta la etiqueta «Sale hoy».`);
  } else if (classes.includes("release-today")) {
    fail(`${id}: release-today solo puede usarse durante su fecha de lanzamiento.`);
  }
  if (date < TODAY && !/class="[^"]*\bhype-out\b[^"]*"[^>]*>Ya disponible<\/span>/.test(block.outer)) {
    fail(`${id}: un lanzamiento pasado debe figurar como «Ya disponible».`);
  }

  if (release) {
    const expectedPlatformKeys = sortPlatformKeys(release.platformKeys || [], platformOrder).join(" ");
    if (attrs["data-plat"] !== expectedPlatformKeys) fail(`${id}: data-plat no respeta el orden canónico de plataformas.`);
    const expectedPlatformsHtml = sortPlatformsHtml(release.platformsHtml || "", platformOrder);
    if (!block.outer.includes(`<div class="platforms">${expectedPlatformsHtml}</div>`)) {
      fail(`${id}: la tarjeta generada no respeta el orden visible de plataformas.`);
    }
    const imageHost = sourceHost(release.image?.src || "");
    const steamApp = /store\.steampowered\.com\/app\/(\d+)/i.exec(release.store?.url || "")?.[1];
    if (steamApp && imageHost.endsWith(".blob.core.windows.net")) {
      const expected = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${steamApp}/header.jpg`;
      if (!block.outer.includes(`src="${expected}"`)) fail(`${id}: la imagen lenta de Azure no se ha sustituido por la copia optimizada de Steam.`);
    }
  }
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

requireRawgAttribution(calendarHtml, "Calendario completo");
requireRawgAttribution(homeHtml, "Calendario de portada");

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

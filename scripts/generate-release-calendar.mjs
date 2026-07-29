import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  addMonths,
  escapeHtml,
  monthKey,
  monthLabel,
  replaceElementInner,
  resolveCountdown,
  selectHomeReleases,
  shortMonth,
  sourceHost,
  spanishLongDate,
  todayMadrid
} from "./calendar-utils.mjs";

const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, "data", "calendar.json");
const CALENDAR_FILE = path.join(ROOT, "calendario.html");
const HOME_FILE = path.join(ROOT, "index.html");
const TODAY = process.env.CALENDAR_TODAY || todayMadrid();
// Bump this value whenever js/main.js changes so generated pages invalidate cache.
const MAIN_ASSET_VERSION = "20260730-2";

const data = JSON.parse(await readFile(DATA_FILE, "utf8"));
const wishIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
const trailerIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z"/></svg>';

function displayMonthLabel(key) {
  return monthLabel(key).replace(" de ", " ");
}

function updateMainAssetVersion(html) {
  return html.replace(/js\/main\.js\?v=[^"']+/, `js/main.js?v=${MAIN_ASSET_VERSION}`);
}

function linkAttributes(link, fallbackTitle, fallbackAria) {
  if (!link?.url) return "";
  return [
    `href="${escapeHtml(link.url)}"`,
    'target="_blank"',
    'rel="noopener noreferrer"',
    `title="${escapeHtml(link.title || fallbackTitle)}"`,
    `aria-label="${escapeHtml(link.ariaLabel || fallbackAria)}"`
  ].join(" ");
}

function headingHtml(release) {
  let html = release.headingHtml || escapeHtml(release.title);
  if (!release.headingHtml && release.tag) html += ` <span class="tag-dlc">${escapeHtml(release.tag)}</span>`;
  return html.replace(/<\/(a|span)>(?=<(?:a|span)\b)/g, "</$1> ");
}

function optimizedImageSource(release, image) {
  const source = image?.src || "";
  let host = "";
  try { host = new URL(source).hostname.toLowerCase(); }
  catch { return source; }

  const appId = /store\.steampowered\.com\/app\/(\d+)/i.exec(release.store?.url || "")?.[1];
  if (appId && host.endsWith(".blob.core.windows.net")) {
    return `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;
  }
  return source;
}

function usesRawgImage(release) {
  const host = sourceHost(optimizedImageSource(release, release.image || {}));
  return host === "media.rawg.io" || host.endsWith(".rawg.io");
}

function rawgAttribution(releases) {
  if (!releases.some(usesRawgImage)) return "";
  return '<p class="rawg-attribution">Algunas imágenes de juegos proceden de <a href="https://rawg.io/" target="_blank" rel="noopener noreferrer">RAWG</a>.</p>';
}

function badgeFor(release, { home = false } = {}) {
  if (release.date === TODAY) return { class: "hype hype-today hype-max", text: "Sale hoy" };
  if (release.date < TODAY) return { class: "hype hype-out", text: "Ya disponible" };
  if (release.badge) return release.badge;
  if (home && release.tag) return { class: "hype hype-mid", text: release.tag };
  return null;
}

function renderRelease(release, { reveal = true, home = false } = {}) {
  const image = release.image || {};
  const store = release.store;
  const badge = badgeFor(release, { home });
  const isToday = release.date === TODAY;
  const state = isToday ? "today" : (release.date < TODAY ? "available" : "upcoming");
  const dataAttributes = [
    `data-release-id="${escapeHtml(release.id)}"`,
    `data-release-date="${escapeHtml(release.date)}"`,
    `data-release-month="${escapeHtml(monthKey(release.date))}"`,
    `data-release-state="${state}"`,
    `data-plat="${escapeHtml((release.platformKeys || []).join(" "))}"`
  ];
  if (image.gridArt) dataAttributes.push(`data-grid-art="${escapeHtml(image.gridArt)}"`);
  if (image.poster) dataAttributes.push(`data-poster="${escapeHtml(image.poster)}"`);

  const imageClass = image.className ? ` class="${escapeHtml(image.className)}"` : "";
  const imageSource = optimizedImageSource(release, image);
  const storeLink = store?.url
    ? `<a class="wish" ${linkAttributes(store, "Ver ficha oficial", `Ver ficha oficial de ${release.title}`)}>${wishIcon}</a>`
    : "";
  const trailerLink = release.trailer
    ? `<a class="trailer" href="${escapeHtml(release.trailer)}" target="_blank" rel="noopener noreferrer" title="Ver el tráiler oficial en YouTube" aria-label="Ver el tráiler oficial de ${escapeHtml(release.title)} en YouTube">${trailerIcon}</a>`
    : "";
  const badgeHtml = badge ? `<span class="${escapeHtml(badge.class)}">${escapeHtml(badge.text)}</span>` : "";
  const releaseClasses = `release${reveal ? " reveal" : ""}${isToday ? " release-today" : ""}`;
  return `<div class="${releaseClasses}" ${dataAttributes.join(" ")}><div class="release-art"><img${imageClass} src="${escapeHtml(imageSource)}" alt="${escapeHtml(image.alt || release.title)}" loading="lazy" decoding="async"><div class="rdate"><b>${Number(release.date.slice(8, 10))}</b><span>${shortMonth(release.date)}</span></div>${trailerLink}${storeLink}</div><div><h4>${headingHtml(release)}</h4><div class="platforms">${release.platformsHtml || escapeHtml((release.platformKeys || []).join(" · "))}</div></div>${badgeHtml}</div>`;
}

function monthSuffix(kind) {
  if (kind === "past") return ' <small style="opacity:.6;font-weight:600">· ya disponibles</small>';
  if (kind === "today") return ' <small style="opacity:.82;font-weight:700">· lanzamiento hoy</small>';
  if (kind === "future-current") return ' <small style="opacity:.6;font-weight:600">· por venir</small>';
  return "";
}

function visibleReleases() {
  const currentMonth = monthKey(TODAY);
  const start = addMonths(currentMonth, -(data.settings?.archiveMonths ?? 1));
  return data.releases
    .filter((release) => monthKey(release.date) >= start)
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title, "es"));
}

function renderCalendarReleases(releases) {
  const groups = new Map();
  for (const release of releases) {
    const key = monthKey(release.date);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(release);
  }
  const currentMonth = monthKey(TODAY);
  const chunks = [];
  for (const [key, monthReleases] of groups) {
    const past = monthReleases.filter((release) => release.date < TODAY);
    const active = monthReleases.filter((release) => release.date >= TODAY);
    if (past.length) {
      chunks.push(`<div class="month-label reveal" data-month="${key}">${displayMonthLabel(key)}${monthSuffix("past")}</div>`);
      chunks.push(...past.map((release) => renderRelease(release)));
    }
    if (active.length) {
      const hasToday = active.some((release) => release.date === TODAY);
      const kind = hasToday ? "today" : (key === currentMonth && past.length ? "future-current" : "future");
      chunks.push(`<div class="month-label reveal" data-month="${key}">${displayMonthLabel(key)}${monthSuffix(kind)}</div>`);
      chunks.push(...active.map((release) => renderRelease(release)));
    }
  }
  const attribution = rawgAttribution(releases);
  if (attribution) chunks.push(attribution);
  return `\n    ${chunks.join("\n    ")}\n  `;
}

function replaceMonthOptions(html, releases) {
  const keys = [...new Set(releases.map((release) => monthKey(release.date)))];
  const options = [
    '<option value="all">Todos los meses</option>',
    ...keys.map((key) => `<option value="${key}">${displayMonthLabel(key)}</option>`)
  ].join("\n        ");
  const pattern = /(<select\b[^>]*\bid=["']monthFilter["'][^>]*>)[\s\S]*?(<\/select>)/i;
  if (!pattern.test(html)) throw new Error("No se encontró #monthFilter.");
  return html.replace(pattern, `$1\n        ${options}\n      $2`);
}

function updateCalendarNote(html) {
  const note = `Calendario actualizado a ${spanishLongDate(data.updatedAt)}. No se incluyen títulos sin fecha exacta anunciada. El icono en la carátula enlaza directamente a Steam, PlayStation Store o la ficha oficial del juego, según corresponda.`;
  const pattern = /Calendario actualizado a [^<]+\. No se incluyen títulos sin fecha exacta anunciada\. El icono en la carátula enlaza directamente a Steam, PlayStation Store o la ficha oficial del juego, según corresponda\./;
  if (!pattern.test(html)) throw new Error("No se encontró la nota de actualización del calendario.");
  return html.replace(pattern, note);
}

function balancedDivAt(html, start) {
  const opening = /^<div\b[^>]*>/i.exec(html.slice(start));
  if (!opening) throw new Error("No se encontró un bloque div válido.");
  const tags = /<\/?div\b[^>]*>/gi;
  tags.lastIndex = start + opening[0].length;
  let depth = 1;
  let match;
  while ((match = tags.exec(html))) {
    depth += /^<\/div/i.test(match[0]) ? -1 : 1;
    if (depth === 0) return { start, end: tags.lastIndex, openTag: opening[0] };
  }
  throw new Error("El bloque de cuenta atrás no está cerrado correctamente.");
}

function countdownElement(html) {
  const pattern = /<div\b(?=[^>]*\bclass=["'][^"']*\bcountdown\b[^"']*["'])[^>]*>/i;
  const opening = pattern.exec(html);
  if (!opening) throw new Error("No se encontró el bloque de cuenta atrás.");
  return balancedDivAt(html, opening.index);
}

function updateCountdown(html, release) {
  if (!release) return html;
  const element = countdownElement(html);
  const classes = /\breveal\b/.test(element.openTag) ? "countdown reveal" : "countdown";
  const platforms = release.platformsHtml || escapeHtml((release.platformKeys || []).join(" · "));
  const replacement = `<div class="${classes}" data-countdown-date="${release.date}" data-countdown-title="${escapeHtml(release.title)}"><div class="cd-label"><b>${escapeHtml(release.title)}</b><span>${spanishLongDate(release.date)} · ${platforms}</span></div><div class="cd-units"><div class="cd-unit"><b id="cd-d">—</b><span>Días</span></div><div class="cd-unit"><b id="cd-h">—</b><span>Horas</span></div><div class="cd-unit"><b id="cd-m">—</b><span>Min</span></div><div class="cd-unit"><b id="cd-s">—</b><span>Seg</span></div></div></div>`;
  return html.slice(0, element.start) + replacement + html.slice(element.end);
}

let calendarHtml = await readFile(CALENDAR_FILE, "utf8");
const visible = visibleReleases();
calendarHtml = replaceElementInner(calendarHtml, "releases", renderCalendarReleases(visible));
calendarHtml = replaceMonthOptions(calendarHtml, visible);
calendarHtml = updateCalendarNote(calendarHtml);
calendarHtml = updateCountdown(calendarHtml, resolveCountdown(data, TODAY));
calendarHtml = updateMainAssetVersion(calendarHtml);
await writeFile(CALENDAR_FILE, calendarHtml, "utf8");

let homeHtml = await readFile(HOME_FILE, "utf8");
const homeReleases = selectHomeReleases(data, TODAY);
const homeChunks = homeReleases.map((release) => renderRelease(release, { reveal: false, home: true }));
const homeAttribution = rawgAttribution(homeReleases);
if (homeAttribution) homeChunks.push(homeAttribution);
homeHtml = replaceElementInner(homeHtml, "releases", `\n        ${homeChunks.join("\n        ")}\n      `);
homeHtml = updateCountdown(homeHtml, resolveCountdown(data, TODAY));
homeHtml = homeHtml.replace(/(<h2 class="section-title" data-i18n="cal_title">)Calendario \d{4}(<\/h2>)/, `$1Calendario ${TODAY.slice(0, 4)}$2`);
homeHtml = updateMainAssetVersion(homeHtml);
await writeFile(HOME_FILE, homeHtml, "utf8");

console.log(`Calendario generado con ${visible.length} lanzamientos visibles y ${homeReleases.length} en portada.`);

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { escapeHtml, resolveCountdown, spanishLongDate, todayMadrid } from "./calendar-utils.mjs";

const ROOT = process.cwd();
const TODAY = process.env.CALENDAR_TODAY || todayMadrid();
const data = JSON.parse(await readFile(path.join(ROOT, "data", "calendar.json"), "utf8"));
const release = resolveCountdown(data, TODAY);

function replacement(classes) {
  const platforms = release.platformsHtml || (release.platformKeys || []).join(" · ");
  return `<div class="${classes}" data-countdown-date="${release.date}" data-countdown-title="${escapeHtml(release.title)}"><div class="cd-label"><b>${escapeHtml(release.title)}</b><span>${spanishLongDate(release.date)} · ${platforms}</span></div><div class="cd-units"><div class="cd-unit"><b id="cd-d">—</b><span>Días</span></div><div class="cd-unit"><b id="cd-h">—</b><span>Horas</span></div><div class="cd-unit"><b id="cd-m">—</b><span>Min</span></div><div class="cd-unit"><b id="cd-s">—</b><span>Seg</span></div></div></div>`;
}

function repair(html, nextBlockMarker) {
  const opening = /<div class="countdown(?: reveal)?"[^>]*>/.exec(html);
  if (!opening) throw new Error("No se encontró el bloque de cuenta atrás.");

  const boundary = html.indexOf(nextBlockMarker, opening.index + opening[0].length);
  if (boundary < 0) throw new Error(`No se encontró el bloque posterior «${nextBlockMarker}».`);

  const classes = opening[0].includes("countdown reveal") ? "countdown reveal" : "countdown";
  return html.slice(0, opening.index) + replacement(classes) + "\n\n  " + html.slice(boundary);
}

for (const [file, marker] of [
  ["calendario.html", '<div class="calendar-tools'],
  ["index.html", '<div id="releases"']
]) {
  const target = path.join(ROOT, file);
  const html = await readFile(target, "utf8");
  await writeFile(target, repair(html, marker), "utf8");
}

console.log("Cuenta atrás normalizada en calendario y portada.");

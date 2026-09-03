import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const errors = [];
const expect = (condition, message) => { if (!condition) errors.push(message); };
const requiredString = (object, key, label) => expect(typeof object?.[key] === "string" && object[key].trim(), `${label}: falta ${key}`);
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
}[character]));
const youtubeIdFromUrl = (value = "") => {
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] || "";
    if (url.hostname.endsWith("youtube.com")) return url.searchParams.get("v") || "";
  } catch {}
  return "";
};
const DATA_DIR = "data/events";
const APPEARANCE_LABELS = new Set(["World Premiere", "Nuevo tráiler", "Actualización", "Expansión", "Actuación"]);
const archive = await readFile("eventos.html", "utf8");
expect(archive.includes('<link rel="canonical" href="https://finalsecreto.com/eventos">'), "eventos.html: canonical incorrecta");
expect(archive.includes('<meta property="og:image"'), "eventos.html: falta la imagen social");
expect(archive.includes('"@type":"BreadcrumbList"'), "eventos.html: faltan las migas de pan estructuradas");
expect(archive.includes('href="/eventos" class="active"'), "eventos.html: la navegación no marca Eventos como sección activa");
for (const page of ["index.html", "noticias.html", "calendario.html", "juegos.html", "eventos.html", "resenas.html"]) {
  const html = await readFile(page, "utf8");
  expect(html.indexOf('href="/juegos"') < html.indexOf('href="/eventos"') && html.indexOf('href="/eventos"') < html.indexOf('href="/resenas"'), `${page}: Eventos no está entre Juegos y Reseñas`);
}

for (const file of (await readdir(DATA_DIR)).filter((name) => name.endsWith(".json") && !name.startsWith("_"))) {
  const data = JSON.parse(await readFile(path.join(DATA_DIR, file), "utf8"));
  const label = `data/events/${file}`;
  ["id", "title", "shortTitle", "kicker", "status", "phase", "startAt", "updatedAt", "officialUrl", "organizer", "attendanceMode", "streamUrl", "streamYoutubeId", "heroImage", "heroImageAlt", "dateLabel", "countdownTitle", "countdownTimeLabel", "intro", "editorialNote"].forEach((key) => requiredString(data, key, label));
  expect(file === `${data.id}.json`, `${label}: el nombre debe coincidir con id`);
  expect(["upcoming", "live", "finished"].includes(data.phase), `${label}: phase no es válido`);
  expect(Number.isFinite(Date.parse(data.startAt)), `${label}: horario principal inválido`);
  if (data.preShowAt) {
    expect(Number.isFinite(Date.parse(data.preShowAt)), `${label}: horario previo inválido`);
    expect(Date.parse(data.preShowAt) < Date.parse(data.startAt), `${label}: la previa debe comenzar antes de la emisión principal`);
  }
  expect(/^\d{4}-\d{2}-\d{2}$/.test(data.updatedAt), `${label}: updatedAt debe usar AAAA-MM-DD`);
  expect(Array.isArray(data.appearances) && data.appearances.length > 0, `${label}: appearances debe contener presencias confirmadas`);
  expect(Array.isArray(data.announcements), `${label}: announcements debe ser un array`);
  expect(Array.isArray(data.sources) && data.sources.length >= 2, `${label}: sources debe contener al menos dos fuentes`);
  ["title", "description", "ogDescription"].forEach((key) => requiredString(data.seo, key, `${label} > seo`));
  ["line", "emphasis"].forEach((key) => requiredString(data.heroTitle, key, `${label} > heroTitle`));
  if (data.attendanceMode !== "OnlineEventAttendanceMode") ["name", "city", "country"].forEach((key) => requiredString(data.location, key, `${label} > location`));
  ["day", "month", "tag", "title", "summary"].forEach((key) => requiredString(data.homeFeature, key, `${label} > homeFeature`));
  expect(Array.isArray(data.schedule) && data.schedule.length >= 2, `${label}: schedule debe contener al menos dos horarios`);
  expect((data.schedule || []).every((item) => !String(item.value).includes("Japón")), `${label}: schedule conserva horarios de Japón`);
  for (const [index, item] of (data.schedule || []).entries()) {
    ["label", "value"].forEach((key) => requiredString(item, key, `${label} > schedule[${index}]`));
  }
  for (const [index, item] of data.appearances.entries()) {
    ["game", "label", "summary", "sourceUrl"].forEach((key) => requiredString(item, key, `${label} > appearances[${index}]`));
    expect(APPEARANCE_LABELS.has(item.label), `${label} > appearances[${index}]: label debe usar una categoría editorial admitida`);
    if (item.image) {
      ["imageAlt", "imagePosition", "accent"].forEach((key) => requiredString(item, key, `${label} > appearances[${index}]`));
      expect(/^#[0-9a-f]{6}$/i.test(item.accent), `${label} > appearances[${index}]: accent debe ser un color hexadecimal`);
    }
  }
  for (const [index, item] of data.announcements.entries()) {
    ["type", "title", "summary", "sourceUrl"].forEach((key) => requiredString(item, key, `${label} > announcements[${index}]`));
    if (data.phase !== "finished") requiredString(item, "time", `${label} > announcements[${index}]`);
    if (data.phase === "finished") {
      expect(Boolean(item.trailerUrl || item.archiveImage), `${label} > announcements[${index}]: necesita trailerUrl o archiveImage`);
      if (item.trailerUrl) {
        expect(/^https:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)/.test(item.trailerUrl), `${label} > announcements[${index}]: trailerUrl debe enlazar a YouTube`);
        expect(youtubeIdFromUrl(item.trailerUrl) !== data.streamYoutubeId, `${label} > announcements[${index}]: trailerUrl no puede apuntar a la retransmisión completa`);
      }
      if (item.archiveImage) expect(/^https:\/\//.test(item.archiveImage), `${label} > announcements[${index}]: archiveImage debe ser una URL HTTPS`);
      for (const [trailerIndex, trailer] of (item.extraTrailers || []).entries()) {
        ["label", "url"].forEach((key) => requiredString(trailer, key, `${label} > announcements[${index}] > extraTrailers[${trailerIndex}]`));
        expect(/^https:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)/.test(trailer.url || ""), `${label} > announcements[${index}] > extraTrailers[${trailerIndex}]: url debe enlazar a YouTube`);
        expect(youtubeIdFromUrl(trailer.url) !== data.streamYoutubeId, `${label} > announcements[${index}] > extraTrailers[${trailerIndex}]: url no puede apuntar a la retransmisión completa`);
      }
    }
  }
  if (data.phase === "finished") {
    expect(Array.isArray(data.highlights) && data.highlights.length >= 6 && data.highlights.length <= 24, `${label}: highlights debe seleccionar entre 6 y 24 anuncios`);
    expect(new Set(data.highlights || []).size === (data.highlights || []).length, `${label}: highlights contiene títulos duplicados`);
    const announcementTitles = new Set(data.announcements.map((item) => item.title));
    for (const [index, title] of (data.highlights || []).entries()) {
      expect(typeof title === "string" && announcementTitles.has(title), `${label} > highlights[${index}]: el anuncio no existe`);
    }
  }
  for (const [index, item] of data.sources.entries()) {
    ["label", "type", "url"].forEach((key) => requiredString(item, key, `${label} > sources[${index}]`));
  }

  const output = `eventos/${data.id}.html`;
  expect(existsSync(output), `${output}: no existe`);
  if (!existsSync(output)) continue;
  const html = await readFile(output, "utf8");
  expect(html.includes(`data-event-id="${data.id}"`), `${output}: data-event-id no coincide`);
  expect(html.includes(`<link rel="canonical" href="https://finalsecreto.com/eventos/${data.id}">`), `${output}: canonical incorrecta`);
  expect(html.includes('"@type":"BreadcrumbList"'), `${output}: faltan las migas de pan estructuradas`);
  expect(html.includes(data.seo.title), `${output}: falta el título SEO`);
  expect(html.includes(data.streamYoutubeId), `${output}: falta la emisión oficial`);
  expect(!html.includes("Japón") && !html.includes("data-event-local-time"), `${output}: conserva horarios ajenos a España peninsular`);
  expect(html.indexOf('href="/juegos"') < html.indexOf('href="/eventos"') && html.indexOf('href="/eventos"') < html.indexOf('href="/resenas"'), `${output}: Eventos no está entre Juegos y Reseñas`);
  expect(archive.includes(`/eventos/${data.id}`) && archive.includes(data.title), `eventos.html: falta ${data.title}`);
  if (data.phase !== "finished") {
    for (const item of data.appearances) {
      expect(html.includes(escapeHtml(item.game)) && html.includes(escapeHtml(item.summary)), `${output}: falta la presencia de ${item.game}`);
    }
  } else {
    expect(!html.includes('id="confirmados"') && !html.includes('data-event-countdown='), `${output}: el resumen final conserva módulos previos a la gala`);
    expect(!html.includes('class="event-filter"') && !html.includes('class="event-announcement-time"'), `${output}: el resumen final conserva filtros u horas de la cronología`);
    expect(html.includes('data-event-search') && html.includes('data-event-view="highlights"') && html.includes('data-event-view="all"'), `${output}: falta el selector entre destacados y archivo completo`);
    const archiveStages = Array.isArray(data.archiveStages) && data.archiveStages.length ? data.archiveStages : [{ id: "main", label: "Gala" }, { id: "preshow", label: "Pre-show" }];
    for (const stage of archiveStages) expect(html.includes(`data-event-stage-filter="${stage.id}"`), `${output}: falta el filtro ${stage.label}`);
    expect((html.match(/data-event-all-item/g) || []).length === data.announcements.length, `${output}: el archivo completo no contiene todos los anuncios`);
    expect((html.match(/class="event-all-art"/g) || []).length === data.announcements.length, `${output}: faltan imágenes en el archivo completo`);
    const expectedTrailers = data.highlights.reduce((total, title) => {
      const item = data.announcements.find((announcement) => announcement.title === title);
      return total + (item ? 1 + (item.extraTrailers || []).length : 0);
    }, 0);
    expect((html.match(/data-youtube-id=/g) || []).length === expectedTrailers, `${output}: no se han integrado todos los tráilers de los destacados`);
  }
  const visibleAnnouncements = data.announcements;
  for (const item of visibleAnnouncements) {
    expect(html.includes(escapeHtml(item.title)) && html.includes(escapeHtml(item.summary)), `${output}: falta el anuncio ${item.title}`);
  }

  if (data.homeFeatured === true) {
    const home = await readFile("index.html", "utf8");
    const compactHome = home.replace(/\s+/g, " ");
    expect(home.includes(`/eventos/${data.id}`), `index.html: falta el evento destacado ${data.id}`);
    expect(compactHome.includes(escapeHtml(data.homeFeature.tag)) && compactHome.includes(escapeHtml(data.homeFeature.title)) && compactHome.includes(escapeHtml(data.homeFeature.summary)), `index.html: la destacada inicial de ${data.id} no coincide con sus datos`);
    expect(home.includes(data.heroImage), `index.html: la destacada inicial de ${data.id} no usa su imagen actual`);
    const homeScript = await readFile("js/home-featured.js", "utf8");
    expect(homeScript.includes(`/data/events/${data.id}.json`), `js/home-featured.js: no carga los datos de ${data.id}`);
  }
}

if (errors.length) {
  console.error(`Validación de eventos fallida (${errors.length} problemas):\n\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log("Eventos validados correctamente.");

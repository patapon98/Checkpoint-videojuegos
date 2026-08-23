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
const DATA_DIR = "data/events";
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
  ["id", "title", "shortTitle", "kicker", "status", "phase", "preShowAt", "startAt", "updatedAt", "officialUrl", "organizer", "attendanceMode", "streamUrl", "streamYoutubeId", "heroImage", "heroImageAlt", "dateLabel", "countdownTitle", "countdownTimeLabel", "intro", "editorialNote"].forEach((key) => requiredString(data, key, label));
  expect(file === `${data.id}.json`, `${label}: el nombre debe coincidir con id`);
  expect(["upcoming", "live", "finished"].includes(data.phase), `${label}: phase no es válido`);
  expect(Number.isFinite(Date.parse(data.preShowAt)) && Number.isFinite(Date.parse(data.startAt)), `${label}: horarios inválidos`);
  expect(Date.parse(data.preShowAt) < Date.parse(data.startAt), `${label}: la previa debe comenzar antes de la gala`);
  expect(/^\d{4}-\d{2}-\d{2}$/.test(data.updatedAt), `${label}: updatedAt debe usar AAAA-MM-DD`);
  expect(Array.isArray(data.appearances) && data.appearances.length > 0, `${label}: appearances debe contener presencias confirmadas`);
  expect(Array.isArray(data.announcements), `${label}: announcements debe ser un array`);
  expect(Array.isArray(data.sources) && data.sources.length >= 2, `${label}: sources debe contener al menos dos fuentes`);
  ["title", "description", "ogDescription"].forEach((key) => requiredString(data.seo, key, `${label} > seo`));
  ["line", "emphasis"].forEach((key) => requiredString(data.heroTitle, key, `${label} > heroTitle`));
  ["name", "city", "country"].forEach((key) => requiredString(data.location, key, `${label} > location`));
  ["day", "month", "tag", "title", "summary"].forEach((key) => requiredString(data.homeFeature, key, `${label} > homeFeature`));
  expect(Array.isArray(data.schedule) && data.schedule.length >= 2, `${label}: schedule debe contener al menos dos horarios`);
  expect((data.schedule || []).every((item) => !String(item.value).includes("Japón")), `${label}: schedule conserva horarios de Japón`);
  for (const [index, item] of (data.schedule || []).entries()) {
    ["label", "value"].forEach((key) => requiredString(item, key, `${label} > schedule[${index}]`));
  }
  for (const [index, item] of data.appearances.entries()) {
    ["game", "label", "summary", "sourceUrl"].forEach((key) => requiredString(item, key, `${label} > appearances[${index}]`));
  }
  for (const [index, item] of data.announcements.entries()) {
    ["time", "type", "title", "summary", "sourceUrl"].forEach((key) => requiredString(item, key, `${label} > announcements[${index}]`));
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
  for (const item of data.appearances) {
    expect(html.includes(escapeHtml(item.game)) && html.includes(escapeHtml(item.summary)), `${output}: falta la presencia de ${item.game}`);
  }
  for (const item of data.announcements) {
    expect(html.includes(item.title) && html.includes(item.summary), `${output}: falta el anuncio ${item.title}`);
  }

  const home = await readFile("index.html", "utf8");
  expect(home.includes(`/eventos/${data.id}`), `index.html: falta el evento destacado ${data.id}`);
  const homeScript = await readFile("js/home-featured.js", "utf8");
  expect(homeScript.includes(`/data/events/${data.id}.json`), `js/home-featured.js: no carga los datos de ${data.id}`);
}

if (errors.length) {
  console.error(`Validación de eventos fallida (${errors.length} problemas):\n\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log("Eventos validados correctamente.");

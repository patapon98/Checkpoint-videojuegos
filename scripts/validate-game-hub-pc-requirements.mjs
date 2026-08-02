import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "data", "game-hubs");
const gamesDir = join(root, "juegos");
const errors = [];
const CSS_HREF = "/css/game-hub-pc-requirements.css?v=20260803-1";

const text = (value = "") => String(value);
const escapeHtml = (value = "") => text(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
}[char]));
const expect = (condition, message) => {
  if (!condition) errors.push(message);
};
const isPcGame = (data) => (data.platforms || []).some((platform) => text(platform).trim().toUpperCase() === "PC");

const files = readdirSync(dataDir)
  .filter((file) => file.endsWith(".json") && file !== "index.json" && !file.startsWith("_"));

for (const file of files) {
  const data = JSON.parse(readFileSync(join(dataDir, file), "utf8"));
  const pagePath = join(gamesDir, `${data.id}.html`);
  const label = `juegos/${data.id}.html`;
  expect(existsSync(pagePath), `${label}: no existe`);
  if (!existsSync(pagePath)) continue;

  const html = readFileSync(pagePath, "utf8");
  const header = html.match(/<header\b[\s\S]*?<\/header>/i)?.[0] || "";
  expect(!/\bsource-item\b/.test(header), `${label}: hay una tarjeta de fuente dentro de la cabecera`);
  expect(html.includes(CSS_HREF), `${label}: falta la hoja de estilos de requisitos de PC`);

  const sectionIndex = html.indexOf('id="requisitos-pc"');
  const newsIndex = html.indexOf('id="noticias"');
  const sourcesIndex = html.indexOf('id="fuentes"');

  if (!isPcGame(data)) {
    expect(sectionIndex === -1, `${label}: muestra requisitos pese a no declarar PC`);
    expect(!html.includes('href="#requisitos-pc"'), `${label}: conserva un enlace de navegación a requisitos sin versión PC`);
    continue;
  }

  expect(sectionIndex >= 0, `${label}: falta la sección #requisitos-pc`);
  expect(html.includes('href="#requisitos-pc"'), `${label}: falta el enlace de navegación a Requisitos PC`);
  expect(newsIndex >= 0 && sourcesIndex >= 0 && newsIndex < sectionIndex && sectionIndex < sourcesIndex,
    `${label}: Requisitos PC debe aparecer entre Noticias y Fuentes`);
  expect(html.includes(`Requisitos de PC de ${escapeHtml(data.title)}`), `${label}: el título de requisitos no coincide`);

  const requirements = data.pcRequirements;
  const available = requirements
    && Array.isArray(requirements.minimum)
    && requirements.minimum.length
    && Array.isArray(requirements.recommended)
    && requirements.recommended.length;

  if (!available) {
    expect(html.includes("Requisitos pendientes"), `${label}: falta el aviso de requisitos todavía no publicados`);
    continue;
  }

  expect(/^https:\/\//.test(requirements.sourceUrl || ""), `${file}: pcRequirements.sourceUrl debe usar HTTPS`);
  for (const groupName of ["minimum", "recommended"]) {
    const group = requirements[groupName];
    expect(Array.isArray(group) && group.length >= 4, `${file}: pcRequirements.${groupName} debe contener al menos cuatro filas`);
    for (const [index, item] of (group || []).entries()) {
      expect(typeof item?.label === "string" && item.label.trim(), `${file}: ${groupName}[${index}] necesita label`);
      expect(typeof item?.value === "string" && item.value.trim(), `${file}: ${groupName}[${index}] necesita value`);
      if (item?.label) expect(html.includes(escapeHtml(item.label)), `${label}: no muestra ${groupName}[${index}].label`);
      if (item?.value) expect(html.includes(escapeHtml(item.value)), `${label}: no muestra ${groupName}[${index}].value`);
    }
  }
  for (const note of requirements.notes || []) {
    expect(typeof note === "string" && note.trim(), `${file}: pcRequirements.notes contiene una nota vacía`);
    if (note) expect(html.includes(escapeHtml(note)), `${label}: no muestra una nota de requisitos`);
  }
  expect(html.includes(escapeHtml(requirements.sourceUrl)), `${label}: no enlaza la fuente oficial de requisitos`);
}

if (errors.length) {
  console.error(`Validación de requisitos de PC fallida (${errors.length} problemas):\n`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Requisitos de PC validados en ${files.length} fichas y cabeceras sin tarjetas de fuentes.`);

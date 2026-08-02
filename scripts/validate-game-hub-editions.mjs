import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "data", "game-hubs");
const gamesDir = join(root, "juegos");
const errors = [];
const CSS_HREF = "/css/game-hub-editions.css?v=20260803-1";

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

const files = readdirSync(dataDir)
  .filter((file) => file.endsWith(".json") && file !== "index.json" && !file.startsWith("_"));

for (const file of files) {
  const data = JSON.parse(readFileSync(join(dataDir, file), "utf8"));
  const pagePath = join(gamesDir, `${data.id}.html`);
  const label = `juegos/${data.id}.html`;
  expect(existsSync(pagePath), `${label}: no existe`);
  if (!existsSync(pagePath)) continue;

  const html = readFileSync(pagePath, "utf8");
  expect(html.includes(CSS_HREF), `${label}: falta la hoja de estilos de Ediciones`);
  expect(html.includes('id="ediciones"'), `${label}: falta la sección #ediciones`);
  expect(html.includes('href="#ediciones"'), `${label}: falta el enlace de navegación a Ediciones`);
  expect(html.includes(`Ediciones de ${escapeHtml(data.title)}`), `${label}: el título de Ediciones no coincide`);

  const newsIndex = html.indexOf('id="noticias"');
  const editionsIndex = html.indexOf('id="ediciones"');
  const requirementsIndex = html.indexOf('id="requisitos-pc"');
  const sourcesIndex = html.indexOf('id="fuentes"');
  const nextIndex = requirementsIndex >= 0 ? requirementsIndex : sourcesIndex;
  expect(newsIndex >= 0 && nextIndex >= 0 && newsIndex < editionsIndex && editionsIndex < nextIndex,
    `${label}: Ediciones debe aparecer después de Noticias y antes de Requisitos PC o Fuentes`);

  const editions = data.editions;
  const available = editions && Array.isArray(editions.items) && editions.items.length;
  if (!available) {
    expect(html.includes("Ediciones pendientes"), `${label}: falta el aviso de ediciones todavía no anunciadas`);
    continue;
  }

  expect(/^https:\/\//.test(editions.sourceUrl || ""), `${file}: editions.sourceUrl debe usar HTTPS`);
  expect(typeof editions.region === "string" && editions.region.trim(), `${file}: editions.region debe indicar el mercado de precios`);
  expect(Array.isArray(editions.items) && editions.items.length >= 1 && editions.items.length <= 5,
    `${file}: editions.items debe contener entre una y cinco entradas`);

  const names = new Set();
  for (const [index, item] of (editions.items || []).entries()) {
    expect(typeof item?.name === "string" && item.name.trim(), `${file}: editions.items[${index}] necesita name`);
    if (item?.name) {
      const normalized = item.name.trim().toLocaleLowerCase("es");
      expect(!names.has(normalized), `${file}: nombre de edición duplicado (${item.name})`);
      names.add(normalized);
      expect(html.includes(escapeHtml(item.name)), `${label}: no muestra el nombre ${item.name}`);
    }
    expect(Array.isArray(item?.prices) && item.prices.length >= 1 && item.prices.length <= 4,
      `${file}: editions.items[${index}].prices debe contener entre uno y cuatro precios`);
    for (const [priceIndex, price] of (item?.prices || []).entries()) {
      expect(typeof price?.platform === "string" && price.platform.trim(), `${file}: precio ${index}.${priceIndex} necesita platform`);
      expect(typeof price?.value === "string" && price.value.trim(), `${file}: precio ${index}.${priceIndex} necesita value`);
      if (price?.platform) expect(html.includes(escapeHtml(price.platform)), `${label}: no muestra una plataforma de precio`);
      if (price?.value) expect(html.includes(escapeHtml(price.value)), `${label}: no muestra el precio ${price.value}`);
    }
    expect(Array.isArray(item?.includes) && item.includes.length >= 1,
      `${file}: editions.items[${index}].includes debe contener al menos un elemento`);
    for (const entry of item?.includes || []) {
      expect(typeof entry === "string" && entry.trim(), `${file}: una edición contiene un elemento vacío`);
      if (entry) expect(html.includes(escapeHtml(entry)), `${label}: no muestra un contenido de edición`);
    }
  }

  for (const bonus of editions.preorderBonuses || []) {
    expect(typeof bonus === "string" && bonus.trim(), `${file}: editions.preorderBonuses contiene un valor vacío`);
    if (bonus) expect(html.includes(escapeHtml(bonus)), `${label}: no muestra una bonificación por reserva`);
  }
  for (const note of editions.notes || []) {
    expect(typeof note === "string" && note.trim(), `${file}: editions.notes contiene un valor vacío`);
    if (note) expect(html.includes(escapeHtml(note)), `${label}: no muestra una nota de ediciones`);
  }
  expect(html.includes(escapeHtml(editions.sourceUrl)), `${label}: no enlaza la fuente oficial de ediciones`);
}

if (errors.length) {
  console.error(`Validación de Ediciones fallida (${errors.length} problemas):\n`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Ediciones validadas en ${files.length} fichas.`);

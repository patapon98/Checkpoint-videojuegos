import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const HUBS_DIR = path.join(ROOT, "data", "game-hubs");
const PAGES_DIR = path.join(ROOT, "juegos");
const IGNORED = new Set(["_template.json", "index.json"]);
const CSS_HREF = "/css/game-hub-editions.css?v=20260803-1";

const text = (value = "") => String(value);
const escapeHtml = (value = "") => text(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
}[char]));
const escapeAttribute = escapeHtml;

function pricesMarkup(prices = []) {
  return prices.map((price) => `
              <div class="game-edition-price">
                <span>${escapeHtml(price.platform)}</span>
                <strong>${escapeHtml(price.value)}</strong>
              </div>`).join("");
}

function editionCard(item, index) {
  const kind = item.kind ? `<span class="game-edition-kind">${escapeHtml(item.kind)}</span>` : "";
  return `
          <article class="game-edition-card${index === 0 ? " game-edition-card-base" : ""}">
            <div class="game-edition-card-heading">
              <div>${kind}<h3>${escapeHtml(item.name)}</h3></div>
              <div class="game-edition-prices">${pricesMarkup(item.prices)}</div>
            </div>
            <ul>${(item.includes || []).map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}</ul>
          </article>`;
}

function editionsSection(data) {
  const editions = data.editions;
  const available = editions && Array.isArray(editions.items) && editions.items.length;

  if (!available) {
    return `
      <section id="ediciones" class="game-section game-editions reveal">
        <div class="section-heading">
          <span class="game-kicker">Compra y reservas</span>
          <h2>Ediciones de ${escapeHtml(data.title)}</h2>
          <p>La editora todavía no ha detallado las ediciones, sus contenidos ni los precios oficiales en España.</p>
        </div>
        <div class="game-editions-empty">
          <strong>Ediciones pendientes</strong>
          <p>Actualizaremos esta sección cuando se abran las reservas o se publiquen las distintas versiones del juego.</p>
        </div>
      </section>
`;
  }

  const bonuses = Array.isArray(editions.preorderBonuses) && editions.preorderBonuses.length
    ? `<div class="game-editions-extra"><span>Bonificaciones por reserva</span><ul>${editions.preorderBonuses.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>`
    : "";
  const notes = Array.isArray(editions.notes) && editions.notes.length
    ? `<ul class="game-editions-notes">${editions.notes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : "";
  const source = editions.sourceUrl
    ? `<a class="game-editions-source" href="${escapeAttribute(editions.sourceUrl)}" target="_blank" rel="noopener noreferrer">Consultar ediciones oficiales ↗</a>`
    : "";
  const extras = [bonuses, notes, source]
    .filter(Boolean)
    .map((markup) => `\n        ${markup}`)
    .join("");

  return `
      <section id="ediciones" class="game-section game-editions reveal">
        <div class="section-heading">
          <span class="game-kicker">Compra y reservas</span>
          <h2>Ediciones de ${escapeHtml(data.title)}</h2>
          <p>Precios y contenido de cada edición confirmada${editions.region ? ` para ${escapeHtml(editions.region)}` : ""}.</p>
        </div>
        <div class="game-editions-grid">${editions.items.map(editionCard).join("")}</div>${extras}
      </section>
`;
}

function removeExistingSection(html) {
  return html.replace(/\n?\s*<section\b[^>]*\bid="ediciones"[^>]*>[\s\S]*?<\/section>\s*/i, "\n");
}

function updateEditionsSection(html, data) {
  let output = removeExistingSection(html);
  output = output.replace(/\s*<a\b[^>]*href="#ediciones"[^>]*>[\s\S]*?<\/a>/gi, "");

  const changesSection = /(<section\b[^>]*\bid="cambios"[^>]*>)/i;
  if (!changesSection.test(output)) throw new Error(`${data.id}: no se encontró el historial de cambios`);
  output = output.replace(changesSection, `${editionsSection(data)}\n      $1`);

  const changesNav = /<a\s+href="#cambios">Cambios<\/a>/i;
  if (!changesNav.test(output)) throw new Error(`${data.id}: no se encontró el enlace de navegación a Cambios`);
  output = output.replace(changesNav, '<a href="#ediciones">Ediciones</a><a href="#cambios">Cambios</a>');
  return output;
}

function ensureStylesheet(html) {
  if (html.includes(CSS_HREF)) return html;
  const marker = '<link rel="stylesheet" href="/css/game-hub-interactions.css';
  const index = html.indexOf(marker);
  if (index >= 0) return html.slice(0, index) + `<link rel="stylesheet" href="${CSS_HREF}">\n` + html.slice(index);
  if (!html.includes("</head>")) throw new Error("No se encontró </head>");
  return html.replace("</head>", `<link rel="stylesheet" href="${CSS_HREF}">\n</head>`);
}

const files = (await readdir(HUBS_DIR))
  .filter((file) => file.endsWith(".json") && !IGNORED.has(file))
  .sort();
let changed = 0;

for (const file of files) {
  const data = JSON.parse(await readFile(path.join(HUBS_DIR, file), "utf8"));
  const pagePath = path.join(PAGES_DIR, `${data.id}.html`);
  const original = await readFile(pagePath, "utf8");
  let html = ensureStylesheet(original);
  html = updateEditionsSection(html, data);

  if (html !== original) {
    await writeFile(pagePath, html, "utf8");
    changed += 1;
  }
  console.log(`${data.id}: ${data.editions?.items?.length || 0} ediciones sincronizadas`);
}

console.log(`Ediciones actualizadas en ${changed} de ${files.length} fichas.`);

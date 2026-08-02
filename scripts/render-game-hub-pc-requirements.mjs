import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const HUBS_DIR = path.join(ROOT, "data", "game-hubs");
const PAGES_DIR = path.join(ROOT, "juegos");
const IGNORED = new Set(["_template.json", "index.json"]);
const CSS_HREF = "/css/game-hub-pc-requirements.css?v=20260803-1";

const text = (value = "") => String(value);
const escapeHtml = (value = "") => text(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
}[char]));
const escapeAttribute = escapeHtml;

function isPcGame(data) {
  return (data.platforms || []).some((platform) => text(platform).trim().toUpperCase() === "PC");
}

function requirementsRows(items = []) {
  return items.map((item) => `
            <div class="game-pc-requirement-row">
              <dt>${escapeHtml(item.label)}</dt>
              <dd>${escapeHtml(item.value)}</dd>
            </div>`).join("");
}

function requirementsSection(data) {
  const requirements = data.pcRequirements;
  const available = requirements
    && Array.isArray(requirements.minimum)
    && requirements.minimum.length
    && Array.isArray(requirements.recommended)
    && requirements.recommended.length;

  if (!available) {
    return `
      <section id="requisitos-pc" class="game-section game-pc-requirements reveal">
        <div class="section-heading">
          <span class="game-kicker">Versión para ordenador</span>
          <h2>Requisitos de PC de ${escapeHtml(data.title)}</h2>
          <p>La versión para PC está confirmada, pero sus especificaciones mínimas y recomendadas todavía no se han publicado.</p>
        </div>
        <div class="game-pc-requirements-empty">
          <strong>Requisitos pendientes</strong>
          <p>Actualizaremos esta sección cuando la desarrolladora, la editora o la tienda oficial publique los datos técnicos.</p>
        </div>
      </section>
`;
  }

  const notes = Array.isArray(requirements.notes) && requirements.notes.length
    ? `<ul class="game-pc-requirements-notes">${requirements.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul>`
    : "";
  const source = requirements.sourceUrl
    ? `<a class="game-pc-requirements-source" href="${escapeAttribute(requirements.sourceUrl)}" target="_blank" rel="noopener noreferrer">Consultar requisitos oficiales ↗</a>`
    : "";

  return `
      <section id="requisitos-pc" class="game-section game-pc-requirements reveal">
        <div class="section-heading">
          <span class="game-kicker">Versión para ordenador</span>
          <h2>Requisitos de PC de ${escapeHtml(data.title)}</h2>
          <p>Configuraciones oficiales mínimas y recomendadas para jugar en ordenador.</p>
        </div>
        <div class="game-pc-requirements-grid">
          <article class="game-pc-requirements-card">
            <span class="game-pc-requirements-label">Configuración mínima</span>
            <h3>Mínimos</h3>
            <dl>${requirementsRows(requirements.minimum)}</dl>
          </article>
          <article class="game-pc-requirements-card game-pc-requirements-card-recommended">
            <span class="game-pc-requirements-label">Configuración recomendada</span>
            <h3>Recomendados</h3>
            <dl>${requirementsRows(requirements.recommended)}</dl>
          </article>
        </div>
        ${notes}
        ${source}
      </section>
`;
}

function removeExistingSection(html) {
  return html.replace(/\n?\s*<section\b[^>]*\bid="requisitos-pc"[^>]*>[\s\S]*?<\/section>\s*/i, "\n");
}

function updateRequirementsSection(html, data) {
  let output = removeExistingSection(html);
  output = output.replace(/\s*<a\b[^>]*href="#requisitos-pc"[^>]*>[\s\S]*?<\/a>/gi, "");

  if (!isPcGame(data)) return output;

  const sourceSection = /(<section\b[^>]*\bid="fuentes"[^>]*>)/i;
  if (!sourceSection.test(output)) throw new Error(`${data.id}: no se encontró la sección #fuentes`);
  output = output.replace(sourceSection, `${requirementsSection(data)}\n      $1`);

  const sourceNav = /<a\s+href="#fuentes">Fuentes<\/a>/i;
  if (!sourceNav.test(output)) throw new Error(`${data.id}: no se encontró el enlace de navegación a Fuentes`);
  output = output.replace(sourceNav, '<a href="#requisitos-pc">Requisitos PC</a><a href="#fuentes">Fuentes</a>');
  return output;
}

function ensureStylesheet(html) {
  if (html.includes(CSS_HREF)) return html;
  const marker = '<link rel="stylesheet" href="/css/game-hub-interactions.css';
  const index = html.indexOf(marker);
  if (index >= 0) {
    return html.slice(0, index) + `<link rel="stylesheet" href="${CSS_HREF}">\n` + html.slice(index);
  }
  if (!html.includes("</head>")) throw new Error("No se encontró </head>");
  return html.replace("</head>", `<link rel="stylesheet" href="${CSS_HREF}">\n</head>`);
}

function sanitizeHeader(html) {
  return html.replace(/<header\b[\s\S]*?<\/header>/i, (header) => header.replace(
    /\s*<a\b(?=[^>]*\bclass="[^"]*\bsource-item\b[^"]*")[^>]*>[\s\S]*?<\/a>/gi,
    ""
  ));
}

const files = (await readdir(HUBS_DIR))
  .filter((file) => file.endsWith(".json") && !IGNORED.has(file))
  .sort();
let changed = 0;

for (const file of files) {
  const data = JSON.parse(await readFile(path.join(HUBS_DIR, file), "utf8"));
  const pagePath = path.join(PAGES_DIR, `${data.id}.html`);
  const original = await readFile(pagePath, "utf8");
  let html = sanitizeHeader(original);
  html = ensureStylesheet(html);
  html = updateRequirementsSection(html, data);

  if (html !== original) {
    await writeFile(pagePath, html, "utf8");
    changed += 1;
  }
  console.log(`${data.id}: ${isPcGame(data) ? "sección PC sincronizada" : "sin versión PC"}`);
}

console.log(`Requisitos de PC actualizados en ${changed} de ${files.length} fichas.`);

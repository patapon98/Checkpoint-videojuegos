/**
 * Vuelca en el HTML de las fichas de juego las secciones que hasta ahora solo
 * se construian en el navegador: galeria, multimedia y noticias relacionadas.
 *
 * El objetivo es que ese contenido exista en el codigo fuente y los buscadores
 * lo vean sin depender de JavaScript. game-hub.js sigue repintando lo mismo al
 * cargar, asi que el marcado generado aqui replica sus plantillas para que el
 * DOM resultante sea equivalente y no haya salto visual.
 *
 * Es el mismo patron que ya usaban los datos, los listados y las fuentes.
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const HUBS_DIR = path.join(ROOT, "data", "game-hubs");
const PAGES_DIR = path.join(ROOT, "juegos");
const INDEX_PAGE = path.join(ROOT, "juegos.html");
const NEWS_FILE = path.join(ROOT, "js", "news-data.js");
const SITE_ORIGIN = "https://finalsecreto.com";
const IGNORED = new Set(["_template.json", "index.json"]);

const text = (value = "") => String(value);

const escapeHtml = (value = "") =>
  text(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));

const formatDate = (value) =>
  new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" })
    .format(new Date(`${value}T12:00:00`));

function youtubeId(value = "") {
  const raw = text(value).trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  try {
    const url = new URL(raw);
    if (url.hostname.includes("youtu.be")) return url.pathname.split("/").filter(Boolean)[0] || "";
    if (url.pathname.startsWith("/shorts/")) return url.pathname.split("/")[2] || "";
    if (url.pathname.startsWith("/embed/")) return url.pathname.split("/")[2] || "";
    return url.searchParams.get("v") || "";
  } catch {
    return "";
  }
}

/** Lee window.FINALSECRETO_NEWS sin navegador. */
async function loadNews() {
  const source = await readFile(NEWS_FILE, "utf8");
  const shim = {};
  new Function("window", source)(shim);
  return Array.isArray(shim.FINALSECRETO_NEWS) ? shim.FINALSECRETO_NEWS : [];
}

/** Mismo filtrado que relatedNews() en game-hub.js. */
function relatedNews(data, allNews) {
  const terms = (Array.isArray(data.newsTerms) && data.newsTerms.length ? data.newsTerms : [data.title])
    .filter(Boolean)
    .map((term) => text(term).toLocaleLowerCase("es"));

  return allNews.filter((item) => {
    const haystack = [
      item.id,
      item.title?.es,
      item.summary?.es,
      item.why?.es,
      item.ticker?.keyword?.es,
      item.ticker?.copy?.es
    ].filter(Boolean).join(" ").toLocaleLowerCase("es");
    return terms.some((term) => haystack.includes(term));
  }).sort((a, b) => new Date(b.updated || b.date) - new Date(a.updated || a.date));
}

function galleryMarkup(data) {
  const images = Array.isArray(data.gallery)
    ? data.gallery.filter((item) => item?.src).map((item, index) => ({
      src: item.src,
      alt: item.alt || `${data.title}, imagen ${index + 1}`
    }))
    : [];

  if (!images.length) {
    return '<div class="gallery-placeholder">Todavía no hay imágenes oficiales disponibles.</div>';
  }

  return `
      <div class="game-gallery-slider" data-gallery-slider>
        <div class="game-gallery-stage">
          <button class="game-gallery-arrow game-gallery-prev" type="button" aria-label="Imagen anterior">←</button>
          <div class="game-gallery-viewport">
            <div class="game-gallery-track">
              ${images.map((item, index) => `
                <button class="game-gallery-slide" type="button" data-gallery-open="${index}"
                        aria-label="Ampliar imagen ${index + 1} de ${images.length}">
                  <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}"
                       loading="${index ? "lazy" : "eager"}" decoding="async">
                  <span class="game-gallery-zoom-hint" aria-hidden="true">⌕ Ampliar</span>
                </button>`).join("")}
            </div>
          </div>
          <button class="game-gallery-arrow game-gallery-next" type="button" aria-label="Imagen siguiente">→</button>
        </div>
        <div class="game-gallery-controls">
          <span class="game-gallery-counter" aria-live="polite">1 / ${images.length}</span>
          <div class="game-gallery-thumbs" aria-label="Seleccionar imagen">
            ${images.map((item, index) => `
              <button class="game-gallery-thumb${index === 0 ? " active" : ""}" type="button"
                      data-gallery-thumb="${index}" aria-label="Mostrar imagen ${index + 1}"
                      aria-pressed="${index === 0}">
                <img src="${escapeHtml(item.src)}" alt="" loading="lazy" decoding="async">
              </button>`).join("")}
          </div>
        </div>
      </div>`;
}

function mediaMarkup(data, news) {
  const media = [];
  const seen = new Set();

  const addVideo = (entry) => {
    const id = youtubeId(entry.videoId || entry.url || "");
    if (!id || seen.has(id)) return;
    seen.add(id);
    media.push({
      id,
      title: entry.title || `Vídeo oficial de ${data.title}`,
      label: entry.label || "Vídeo oficial",
      publishedAt: entry.publishedAt || ""
    });
  };

  (data.media || []).forEach(addVideo);
  news.forEach((item) => {
    if (!item.trailer?.url) return;
    addVideo({
      url: item.trailer.url,
      title: item.title?.es || `Vídeo de ${data.title}`,
      label: item.trailer.label?.es || "Vídeo relacionado",
      publishedAt: item.date
    });
  });

  if (!media.length) {
    return '<div class="gallery-placeholder">Todavía no hay vídeos oficiales disponibles.</div>';
  }

  const cards = media.map((item, index) => `
      <article class="game-media-card game-media-slide" aria-hidden="${index > 0}">
        <div class="game-media-frame">
          <iframe
            src="https://www.youtube-nocookie.com/embed/${escapeHtml(item.id)}?rel=0"
            title="${escapeHtml(item.title)}"
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen></iframe>
        </div>
        <div class="game-media-meta">
          <div>
            <span class="game-kicker">${escapeHtml(item.label)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            ${item.publishedAt ? `<time datetime="${escapeHtml(item.publishedAt)}">${escapeHtml(formatDate(item.publishedAt))}</time>` : ""}
          </div>
          <a href="https://www.youtube.com/watch?v=${escapeHtml(item.id)}" target="_blank" rel="noopener noreferrer">Ver en YouTube ↗</a>
        </div>
      </article>`).join("");

  return `
      <div class="game-media-slider${media.length === 1 ? " is-single" : ""}" data-media-slider>
        <div class="game-media-viewport">
          <div class="game-media-track">${cards}</div>
        </div>
        ${media.length > 1 ? `
          <div class="game-media-controls" aria-label="Controles del carrusel de vídeos">
            <p class="game-media-counter" data-media-counter aria-live="polite">Vídeo <b data-media-current>1</b> de <b>${media.length}</b></p>
            <div class="game-media-nav">
              <button type="button" data-media-prev aria-label="Vídeo anterior" disabled>←</button>
              <div class="game-media-dots" data-media-dots>${media.map((_, index) =>
                `<button type="button" data-media-page="${index}"${index === 0 ? ' class="on"' : ""} aria-label="Mostrar vídeo ${index + 1} de ${media.length}" aria-pressed="${index === 0}"></button>`
              ).join("")}</div>
              <button type="button" data-media-next aria-label="Vídeo siguiente">→</button>
            </div>
          </div>` : ""}
      </div>`;
}

function newsMarkup(news) {
  if (!news.length) {
    return '<div class="gallery-placeholder">Todavía no hay noticias relacionadas publicadas.</div>';
  }
  return news.map((item) => {
    const href = `/noticias.html#${encodeURIComponent(item.id)}`;
    return `<a class="related-news-card" href="${href}"><time class="related-news-date" datetime="${escapeHtml(item.date)}">${escapeHtml(formatDate(item.date))}</time><div><h3>${escapeHtml(item.title.es)}</h3><p>${escapeHtml(item.summary.es)}</p></div><span class="related-news-arrow" aria-hidden="true">→</span></a>`;
  }).join("");
}

/**
 * Sustituye el contenido de un <div id="..."> concreto. Se cuentan los div
 * anidados para encontrar el cierre correcto, porque el contenido generado
 * lleva varios niveles dentro.
 */
function replaceInner(html, id, inner) {
  const open = new RegExp(`<div\\b[^>]*\\bid="${id}"[^>]*>`);
  const match = open.exec(html);
  if (!match) throw new Error(`No se encontró el contenedor #${id}`);

  const start = match.index + match[0].length;
  const tag = /<\/?div\b/gi;
  tag.lastIndex = start;
  let depth = 1;
  let found;
  while ((found = tag.exec(html))) {
    depth += found[0].startsWith("</") ? -1 : 1;
    if (depth === 0) return html.slice(0, start) + inner + html.slice(found.index);
  }
  throw new Error(`El contenedor #${id} no está bien cerrado`);
}

const shortDate = (value) =>
  new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" })
    .format(new Date(`${value}T12:00:00`))
    .replace(".", "");

/** Tarjeta del indice, con las mismas clases que las de la portada. */
function indexCard(data) {
  const accent = data.theme?.accent || "var(--accent)";
  const alt = data.seo?.heroImageAlt || `Imagen de ${data.title}`;
  // Texto que usa el buscador. Va en el marcado para filtrar por los datos de
  // la ficha y no por lo que se ve, que deja fuera genero, estudio y editora.
  const search = [data.title, data.genre, data.developer, data.publisher, data.status, ...data.platforms, data.subtitle]
    .filter(Boolean).join(" ").toLocaleLowerCase("es");
  return `
        <a class="home-game-hub-card" href="/juegos/${escapeHtml(data.id)}" aria-label="Consultar la ficha de ${escapeHtml(data.title)}" data-search="${escapeHtml(search)}" style="--hub-accent:${escapeHtml(accent)}">
          <div class="home-game-hub-art">
            <img src="${escapeHtml(data.heroImage)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async">
            <span class="home-game-hub-status">${escapeHtml(data.status)}</span>
          </div>
          <div class="home-game-hub-body">
            <div class="home-game-hub-meta">
              <time datetime="${escapeHtml(data.releaseDate)}">${escapeHtml(shortDate(data.releaseDate))}</time>
              <span>${escapeHtml(data.platforms.join(" · "))}</span>
            </div>
            <h3>${escapeHtml(data.title)}</h3>
            <p>${escapeHtml(data.subtitle)}</p>
            <div class="home-game-hub-footer">
              <small>Actualizada el ${escapeHtml(shortDate(data.updatedAt))}</small>
              <span>Ver ficha completa →</span>
            </div>
          </div>
        </a>`;
}

/** Rehace el ItemList del indice para que refleje las fichas publicadas. */
function indexStructuredData(html, games) {
  const open = '<script type="application/ld+json" id="gamesIndexStructuredData">';
  const start = html.indexOf(open);
  if (start === -1) throw new Error("juegos.html no declara gamesIndexStructuredData");
  const from = start + open.length;
  const end = html.indexOf("</script>", from);
  const graph = JSON.parse(html.slice(from, end));

  graph.mainEntity.itemListElement = games.map((data, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `${SITE_ORIGIN}/juegos/${data.id}`,
    name: data.title
  }));

  return html.slice(0, from) + JSON.stringify(graph) + html.slice(end);
}

const allNews = await loadNews();
const files = (await readdir(HUBS_DIR)).filter((file) => file.endsWith(".json") && !IGNORED.has(file));
let changed = 0;
const games = [];

for (const file of files.sort()) {
  const data = JSON.parse(await readFile(path.join(HUBS_DIR, file), "utf8"));
  games.push(data);
  const pagePath = path.join(PAGES_DIR, `${data.id}.html`);
  const original = await readFile(pagePath, "utf8");
  const news = relatedNews(data, allNews);

  let html = original;
  html = replaceInner(html, "gameGallery", galleryMarkup(data));
  html = replaceInner(html, "gameMedia", mediaMarkup(data, news));
  html = replaceInner(html, "relatedNews", newsMarkup(news));

  if (html !== original) {
    await writeFile(pagePath, html, "utf8");
    changed++;
  }
  console.log(`${data.id}: ${(data.gallery || []).length} imágenes, ${(data.media || []).length} vídeos, ${news.length} noticias`);
}

// Indice de fichas, ordenado por fecha de lanzamiento mas cercana primero.
const ordered = [...games].sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
const indexOriginal = await readFile(INDEX_PAGE, "utf8");
let indexHtml = replaceInner(indexOriginal, "gamesIndexGrid", ordered.map(indexCard).join("") + "\n      ");
indexHtml = indexStructuredData(indexHtml, ordered);
if (indexHtml !== indexOriginal) {
  await writeFile(INDEX_PAGE, indexHtml, "utf8");
  console.log(`juegos.html actualizado con ${ordered.length} fichas.`);
}

console.log(`Fichas actualizadas: ${changed} de ${files.length}.`);

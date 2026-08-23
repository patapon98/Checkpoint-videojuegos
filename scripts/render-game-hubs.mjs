import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const HUBS_DIR = path.join(ROOT, "data", "game-hubs");
const PAGES_DIR = path.join(ROOT, "juegos");
const INDEX_PAGE = path.join(ROOT, "juegos.html");
const NEWS_FILE = path.join(ROOT, "data", "news-index.json");
const SITEMAP_FILE = path.join(ROOT, "sitemap.xml");
const IGNORED = new Set(["_template.json", "index.json"]);
const SITE_URL = "https://finalsecreto.com";

const text = (value = "") => String(value);
const escapeHtml = (value = "") => text(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
}[char]));
const escapeAttribute = escapeHtml;
const escapeRegex = (value = "") => text(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const safeJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

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

async function loadNews() {
  const news = JSON.parse(await readFile(NEWS_FILE, "utf8"));
  return Array.isArray(news) ? news : [];
}

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
                  <img src="${escapeAttribute(item.src)}" alt="${escapeAttribute(item.alt)}"
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
                <img src="${escapeAttribute(item.src)}" alt="" loading="lazy" decoding="async">
              </button>`).join("")}
          </div>
        </div>
      </div>`;
}

function mediaEntries(data, news) {
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
  return media;
}

function mediaMarkup(data, news) {
  const media = mediaEntries(data, news);
  if (!media.length) {
    return '<div class="gallery-placeholder">Todavía no hay vídeos oficiales disponibles.</div>';
  }

  const cards = media.map((item, index) => `
      <article class="game-media-card game-media-slide" aria-hidden="${index > 0}">
        <div class="game-media-frame">
          <iframe
            src="https://www.youtube-nocookie.com/embed/${escapeAttribute(item.id)}?rel=0"
            title="${escapeAttribute(item.title)}"
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen></iframe>
        </div>
        <div class="game-media-meta">
          <div>
            <span class="game-kicker">${escapeHtml(item.label)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            ${item.publishedAt ? `<time datetime="${escapeAttribute(item.publishedAt)}">${escapeHtml(formatDate(item.publishedAt))}</time>` : ""}
          </div>
          <a href="https://www.youtube.com/watch?v=${escapeAttribute(item.id)}" target="_blank" rel="noopener noreferrer">Ver en YouTube ↗</a>
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
    return `<a class="related-news-card" href="${href}"><time class="related-news-date" datetime="${escapeAttribute(item.date)}">${escapeHtml(formatDate(item.date))}</time><div><h3>${escapeHtml(item.title.es)}</h3><p>${escapeHtml(item.summary.es)}</p></div><span class="related-news-arrow" aria-hidden="true">→</span></a>`;
  }).join("");
}

function factsMarkup(data) {
  return [
    ["Lanzamiento", formatDate(data.releaseDate)],
    ["Género", data.genre],
    ["Plataformas", (data.platforms || []).join(" · ")],
    ["Desarrolladora", data.developer]
  ].map(([label, value]) => `<div class="game-fact"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
}

function spotlightMarkup(data) {
  const spotlight = data.spotlight;
  const cards = spotlight.items.map((item) =>
    `<article class="game-spotlight-card"><span>${escapeHtml(item.title)}</span><strong>${escapeHtml(item.value)}</strong><p>${escapeHtml(item.description)}</p></article>`
  ).join("");
  return `<div class="section-heading"><span class="game-kicker">${escapeHtml(spotlight.kicker)}</span><h2>${escapeHtml(spotlight.title)}</h2><p>${escapeHtml(spotlight.intro)}</p></div><div class="game-spotlight-grid">${cards}</div>`;
}

function quickFactsMarkup(data) {
  const facts = [
    ["Fecha de lanzamiento", formatDate(data.releaseDate)],
    ["Género", data.genre],
    ["Plataformas", (data.platforms || []).join(" · ")]
  ];
  if (data.price) facts.push(["Precio", data.price]);
  facts.push(["Desarrolladora", data.developer], ["Editora", data.publisher]);
  return facts.map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("");
}

function listMarkup(items) {
  return (items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function hasKnowledgeSections(data) {
  return Array.isArray(data.knowledgeSections) && data.knowledgeSections.length > 0;
}

function knowledgeMarkup(data) {
  const cards = data.knowledgeSections.map((section, index) => `
          <article class="knowledge-card">
            <div class="knowledge-card-heading">
              <span class="knowledge-index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
              <div>
                <span class="knowledge-kicker">${escapeHtml(section.kicker)}</span>
                <h3>${escapeHtml(section.title)}</h3>
              </div>
            </div>
            <p class="knowledge-summary">${escapeHtml(section.summary)}</p>
            <ul class="knowledge-highlights">${listMarkup(section.highlights)}</ul>
          </article>`).join("");
  const pending = Array.isArray(data.pendingHighlights) ? data.pendingHighlights : [];

  return `
        <div class="section-heading"><span class="game-kicker">Información verificada</span><h2>Lo esencial de ${escapeHtml(data.title)}</h2><p>La información clave, agrupada por temas para entender el juego de un vistazo.</p></div>
        <div class="knowledge-grid" id="knowledgeSections">${cards}
        </div>
        ${pending.length ? `<aside class="knowledge-pending" id="pendingHighlights" aria-labelledby="pendingHighlightsTitle"><strong id="pendingHighlightsTitle">Todavía por confirmar</strong><ul>${listMarkup(pending)}</ul></aside>` : ""}`;
}

function changesMarkup(data) {
  const changes = Array.isArray(data.changes) ? data.changes : [];
  if (!changes.length) {
    return '<li class="game-change-item"><div><h3>Sin cambios registrados</h3><p>La ficha conserva su primera versión editorial.</p></div></li>';
  }
  return changes.map((item) => `<li class="game-change-item"><time datetime="${escapeAttribute(item.date)}">${escapeHtml(formatDate(item.date))}</time><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div></li>`).join("");
}

function sourcesMarkup(data) {
  return (data.sources || []).map((source) => `<a class="source-item" href="${escapeAttribute(source.url)}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(source.label)}</strong><span>${escapeHtml(source.type)} ↗</span></a>`).join("");
}

function structuredData(data) {
  const canonical = `${SITE_URL}/juegos/${data.id}`;
  const trailers = (data.media || []).map((entry) => ({
    id: youtubeId(entry.videoId || entry.url || ""),
    title: entry.title || `Vídeo oficial de ${data.title}`,
    publishedAt: entry.publishedAt || ""
  })).filter((entry) => entry.id).map((entry) => ({
    "@type": "VideoObject",
    name: entry.title,
    thumbnailUrl: `https://i.ytimg.com/vi/${entry.id}/maxresdefault.jpg`,
    ...(entry.publishedAt ? { uploadDate: entry.publishedAt } : {}),
    embedUrl: `https://www.youtube.com/embed/${entry.id}`
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: data.seo.title,
        description: data.seo.description,
        dateModified: data.updatedAt,
        inLanguage: "es",
        isPartOf: {
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          url: `${SITE_URL}/`,
          name: "Final Secreto"
        },
        mainEntity: { "@id": `${canonical}#game` },
        author: { "@type": "Organization", name: "Final Secreto" }
      },
      {
        "@type": "VideoGame",
        "@id": `${canonical}#game`,
        name: data.title,
        url: canonical,
        description: data.premise,
        image: data.heroImage,
        datePublished: data.releaseDate,
        dateModified: data.updatedAt,
        gamePlatform: data.platforms || [],
        genre: data.genre,
        publisher: { "@type": "Organization", name: data.publisher },
        creator: { "@type": "Organization", name: data.developer },
        sameAs: data.officialUrl,
        mainEntityOfPage: { "@id": `${canonical}#webpage` },
        ...(trailers.length ? { trailer: trailers } : {})
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Portada", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Calendario", item: `${SITE_URL}/calendario` },
          { "@type": "ListItem", position: 3, name: data.title, item: canonical }
        ]
      }
    ]
  };
}

function replaceElementInner(html, id, inner) {
  const open = new RegExp(`<([a-z][\\w:-]*)\\b[^>]*\\bid="${escapeRegex(id)}"[^>]*>`, "i");
  const match = open.exec(html);
  if (!match) throw new Error(`No se encontró el contenedor #${id}`);
  const tagName = match[1];
  const start = match.index + match[0].length;
  const tag = new RegExp(`</?${escapeRegex(tagName)}\\b`, "gi");
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
    url: `${SITE_URL}/juegos/${data.id}`,
    name: data.title
  }));

  return html.slice(0, from) + JSON.stringify(graph) + html.slice(end);
}
function replaceClassElement(html, tagName, className, replacement) {
  const pattern = new RegExp(`<${tagName}\\b(?=[^>]*\\bclass="[^"]*\\b${escapeRegex(className)}\\b[^"]*")[^>]*>[\\s\\S]*?</${tagName}>`, "i");
  if (!pattern.test(html)) throw new Error(`No se encontró .${className}`);
  return html.replace(pattern, replacement);
}

function replaceAttributeInTag(tag, attribute, value) {
  const pattern = new RegExp(`\\s${escapeRegex(attribute)}="[^"]*"`, "i");
  const encoded = escapeAttribute(value);
  if (pattern.test(tag)) return tag.replace(pattern, ` ${attribute}="${encoded}"`);
  return tag.replace(/>$/, ` ${attribute}="${encoded}">`);
}

function replaceElementAttribute(html, id, attribute, value) {
  const pattern = new RegExp(`<([a-z][\\w:-]*)\\b(?=[^>]*\\bid="${escapeRegex(id)}")[^>]*>`, "i");
  if (!pattern.test(html)) throw new Error(`No se encontró #${id} para actualizar ${attribute}`);
  return html.replace(pattern, (tag) => replaceAttributeInTag(tag, attribute, value));
}

function replaceClassElementAttribute(html, tagName, className, attribute, value) {
  const pattern = new RegExp(`<${tagName}\\b(?=[^>]*\\bclass="[^"]*\\b${escapeRegex(className)}\\b[^"]*")[^>]*>`, "i");
  if (!pattern.test(html)) throw new Error(`No se encontró .${className} para actualizar ${attribute}`);
  return html.replace(pattern, (tag) => replaceAttributeInTag(tag, attribute, value));
}

function replaceMeta(html, key, value) {
  const pattern = new RegExp(`<meta\\b(?=[^>]*(?:name|property)="${escapeRegex(key)}")[^>]*>`, "i");
  if (!pattern.test(html)) throw new Error(`No se encontró la meta ${key}`);
  return html.replace(pattern, (tag) => replaceAttributeInTag(tag, "content", value));
}

function replaceTitle(html, value) {
  if (!/<title>[\s\S]*?<\/title>/i.test(html)) throw new Error("No se encontró <title>");
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(value)}</title>`);
}

function replaceStructuredData(html, data) {
  const pattern = /<script type="application\/ld\+json" id="gameStructuredData">[\s\S]*?<\/script>/i;
  if (!pattern.test(html)) throw new Error("No se encontraron los datos estructurados de la ficha");
  return html.replace(pattern, `<script type="application/ld+json" id="gameStructuredData">${safeJson(structuredData(data))}</script>`);
}

function updateBody(html, data) {
  const pattern = /<body\b[^>]*>/i;
  if (!pattern.test(html)) throw new Error("No se encontró <body>");
  return html.replace(pattern, (tag) => {
    let updated = replaceAttributeInTag(tag, "data-game-id", data.id);
    updated = replaceAttributeInTag(updated, "data-game-title", data.title);
    updated = replaceAttributeInTag(updated, "data-release-date", data.releaseDate);
    return replaceAttributeInTag(updated, "style", `--game-gold:${data.theme.accent};--game-gold-soft:${data.theme.accentSoft}`);
  });
}

function updateStaticHtml(html, data, news) {
  const platforms = (data.platforms || []).join(" · ");
  html = replaceTitle(html, data.seo.title);
  html = replaceMeta(html, "description", data.seo.description);
  html = replaceMeta(html, "article:modified_time", data.updatedAt);
  html = replaceMeta(html, "og:title", data.seo.title);
  html = replaceMeta(html, "og:description", data.seo.ogDescription);
  html = replaceMeta(html, "og:image", data.heroImage);
  html = replaceMeta(html, "twitter:image", data.heroImage);
  html = replaceStructuredData(html, data);
  html = updateBody(html, data);

  html = replaceElementAttribute(html, "heroMedia", "aria-label", data.seo.heroImageAlt);
  html = replaceElementAttribute(html, "heroMedia", "style", `background-image:linear-gradient(135deg,rgba(12,13,16,.2),rgba(12,13,16,.06)),url('${data.heroImage}')`);
  html = replaceClassElement(html, "div", "game-eyebrow", `<div class="game-eyebrow"><span class="game-status" id="gameStatus">${escapeHtml(data.status)}</span><span>Ficha viva</span><span>${escapeHtml(platforms)}</span></div>`);
  html = html.replace(/(<section class="game-hero[\s\S]*?<h1>)[\s\S]*?(<\/h1>)/i, `$1${data.seo.heroTitleHtml}$2`);
  html = replaceClassElement(html, "p", "game-deck", `<p class="game-deck">${escapeHtml(data.subtitle)}</p>`);
  html = replaceElementAttribute(html, "wishlistButton", "href", data.storeUrl || data.officialUrl);

  html = replaceElementInner(html, "updatedAt", escapeHtml(formatDate(data.updatedAt)));
  html = replaceElementAttribute(html, "updatedAt", "datetime", data.updatedAt);
  html = replaceElementInner(html, "countdownTitle", escapeHtml(formatDate(data.releaseDate)));
  html = replaceElementInner(html, "gamePremise", escapeHtml(data.premise));
  html = replaceElementInner(html, "gameOverview", escapeHtml(data.overview));
  html = replaceElementInner(html, "gameFacts", factsMarkup(data));
  html = replaceElementInner(html, "gameContext", escapeHtml(data.context));
  html = replaceElementInner(html, "claves", spotlightMarkup(data));
  if (hasKnowledgeSections(data)) {
    html = replaceElementInner(html, "confirmado", knowledgeMarkup(data));
    html = html.replace(/(<a\s+href="#confirmado">)[^<]*(<\/a>)/i, "$1Lo esencial$2");
  } else {
    html = replaceElementInner(html, "confirmedList", listMarkup(data.confirmed));
    html = replaceElementInner(html, "pendingList", listMarkup(data.pending));
    html = html.replace(/(<a\s+href="#confirmado">)[^<]*(<\/a>)/i, "$1Confirmado$2");
  }
  html = replaceElementInner(html, "gameChangeList", changesMarkup(data));
  html = replaceElementInner(html, "gameMedia", mediaMarkup(data, news));
  html = replaceElementInner(html, "gameGallery", galleryMarkup(data));
  html = replaceElementInner(html, "relatedNews", newsMarkup(news));
  html = replaceElementInner(html, "sourceList", sourcesMarkup(data));
  html = replaceElementInner(html, "quickFacts", quickFactsMarkup(data));
  html = replaceClassElementAttribute(html, "a", "game-source-link", "href", data.officialUrl);
  return html;
}

function updateSitemap(sitemap, games) {
  let output = sitemap;
  for (const data of games) {
    const loc = `${SITE_URL}/juegos/${data.id}`;
    const block = new RegExp(`(<url>\\s*<loc>${escapeRegex(loc)}</loc>[\\s\\S]*?<lastmod>)([^<]*)(</lastmod>[\\s\\S]*?</url>)`, "i");
    if (block.test(output)) {
      output = output.replace(block, `$1${data.updatedAt}$3`);
      continue;
    }
    const entry = `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${data.updatedAt}</lastmod>\n  </url>\n`;
    if (!output.includes("</urlset>")) throw new Error("sitemap.xml no contiene </urlset>");
    output = output.replace("</urlset>", `${entry}</urlset>`);
  }
  return output;
}

const allNews = await loadNews();
const files = (await readdir(HUBS_DIR)).filter((file) => file.endsWith(".json") && !IGNORED.has(file));
const games = [];
let changed = 0;

for (const file of files.sort()) {
  const data = JSON.parse(await readFile(path.join(HUBS_DIR, file), "utf8"));
  games.push(data);
  const pagePath = path.join(PAGES_DIR, `${data.id}.html`);
  const original = await readFile(pagePath, "utf8");
  const news = relatedNews(data, allNews);
  const html = updateStaticHtml(original, data, news);

  if (html !== original) {
    await writeFile(pagePath, html, "utf8");
    changed++;
  }
  console.log(`${data.id}: ${(data.gallery || []).length} imágenes, ${(data.media || []).length} vídeos, ${news.length} noticias`);
}

// Indice de fichas, ordenado por fecha de lanzamiento mas cercana primero.
const ordered = [...games].sort((a, b) => a.releaseDate.localeCompare(b.releaseDate));
const indexOriginal = await readFile(INDEX_PAGE, "utf8");
let indexHtml = replaceElementInner(indexOriginal, "gamesIndexGrid", ordered.map(indexCard).join("") + "\n      ");
indexHtml = indexStructuredData(indexHtml, ordered);
if (indexHtml !== indexOriginal) {
  await writeFile(INDEX_PAGE, indexHtml, "utf8");
  console.log(`juegos.html actualizado con ${ordered.length} fichas.`);
}

const originalSitemap = await readFile(SITEMAP_FILE, "utf8");
const sitemap = updateSitemap(originalSitemap, games);
if (sitemap !== originalSitemap) await writeFile(SITEMAP_FILE, sitemap, "utf8");

console.log(`Fichas actualizadas: ${changed} de ${files.length}. Sitemap ${sitemap === originalSitemap ? "sin cambios" : "sincronizado"}.`);

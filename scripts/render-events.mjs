import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data", "events");
const OUTPUT_DIR = path.join(ROOT, "eventos");
const SITE_URL = "https://finalsecreto.com";

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;"
}[character]));

const safeJson = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");

function formatDate(value) {
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric" })
    .format(new Date(`${value}T12:00:00Z`));
}

function typeKey(value = "") {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "otros";
}

function appearanceMarkup(item) {
  const links = [
    item.relatedUrl ? `<a href="${escapeHtml(item.relatedUrl)}">Ver ficha →</a>` : "",
    `<a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">Comprobar fuente ↗</a>`
  ].filter(Boolean).join("\n            ");
  return `<article class="event-appearance reveal">
          <span>${escapeHtml(item.label)}</span>
          <h3>${escapeHtml(item.game)}</h3>
          <p>${escapeHtml(item.summary)}</p>
          <div class="event-appearance-links">
            ${links}
          </div>
        </article>`;
}

function announcementMarkup(item, index) {
  const type = typeKey(item.type);
  const links = [
    item.relatedUrl ? `<a href="${escapeHtml(item.relatedUrl)}">Más información →</a>` : "",
    item.trailerUrl ? `<a href="${escapeHtml(item.trailerUrl)}" target="_blank" rel="noopener noreferrer">Ver tráiler ↗</a>` : "",
    `<a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">Fuente ↗</a>`
  ].filter(Boolean).join("\n              ");
  return `<article class="event-announcement reveal" data-event-type="${escapeHtml(type)}">
          <div class="event-announcement-time">${escapeHtml(item.time || String(index + 1).padStart(2, "0"))}</div>
          <div class="event-announcement-body">
            <span class="event-announcement-tag">${escapeHtml(item.type)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.summary)}</p>
            <div class="event-announcement-links">
              ${links}
            </div>
          </div>
        </article>`;
}

function page(data) {
  const canonical = `${SITE_URL}/eventos/${data.id}`;
  const appearances = data.appearances.map(appearanceMarkup).join("\n        ");
  const announcements = data.announcements.map(announcementMarkup).join("\n        ");
  const filterTypes = [...new Set(data.announcements.map((item) => item.type))];
  const filters = filterTypes.length > 1 ? `<div class="event-filter" aria-label="Filtrar anuncios">
        <button class="on" type="button" data-event-filter="all" aria-pressed="true">Todos</button>
        ${filterTypes.map((type) => `<button type="button" data-event-filter="${escapeHtml(typeKey(type))}" aria-pressed="false">${escapeHtml(type)}</button>`).join("\n        ")}
      </div>` : "";
  const sources = data.sources.map((source) => `<a class="event-source" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer"><b>${escapeHtml(source.label)}</b><span>${escapeHtml(source.type)} ↗</span></a>`).join("\n        ");
  const schedule = data.schedule.map((item) => `<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd></div>`).join("");
  const structuredData = {
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
        isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: "Final Secreto" }
      },
      {
        "@type": "Event",
        "@id": `${canonical}#event`,
        name: data.title,
        description: data.intro,
        startDate: data.startAt,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: `https://schema.org/${data.attendanceMode}`,
        image: data.heroImage,
        location: { "@type": "Place", name: data.location.name, address: { "@type": "PostalAddress", addressLocality: data.location.city, addressCountry: data.location.country } },
        organizer: { "@type": "Organization", name: data.organizer, url: data.officialUrl },
        url: canonical
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(data.seo.title)}</title>
<meta name="description" content="${escapeHtml(data.seo.description)}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" type="image/png" sizes="96x96" href="/favicon-96.png">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Final Secreto">
<meta property="og:title" content="${escapeHtml(data.seo.title)}">
<meta property="og:description" content="${escapeHtml(data.seo.ogDescription)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${escapeHtml(data.heroImage)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(data.seo.title)}">
<meta name="twitter:description" content="${escapeHtml(data.seo.ogDescription)}">
<meta name="twitter:image" content="${escapeHtml(data.heroImage)}">
<script type="application/ld+json">${safeJson(structuredData)}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,600&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css?v=20260729-6">
<link rel="stylesheet" href="/css/brand-logo.css">
<link rel="stylesheet" href="/css/event-hub.css?v=20260823-1">
<script>(function(){try{var saved=localStorage.getItem('finalsecreto-theme');var theme=saved||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',theme);document.documentElement.style.colorScheme=theme}catch(e){}})();</script>
</head>
<body class="event-page" data-event-id="${escapeHtml(data.id)}">
<header>
  <div class="header-inner">
    <a href="/" class="logo"><img class="site-logo-mark" src="/favicon.svg" alt="" aria-hidden="true" width="36" height="36">Final <span>Secreto</span></a>
    <nav>
      <a href="/noticias">Noticias</a>
      <a href="/calendario">Calendario</a>
      <a href="/juegos">Juegos</a>
      <a href="/resenas">Reseñas</a>
      <a href="/sobre-mi">Sobre mí</a>
      <a href="/contacto">Contacto</a>
      <button class="theme-toggle" id="themeToggle" type="button" aria-label="Activar modo oscuro" aria-pressed="false" title="Cambiar tema">
        <svg class="theme-icon theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.4A8.5 8.5 0 0 1 8.6 3.8 8.7 8.7 0 1 0 20.2 15.4Z"/></svg>
        <svg class="theme-icon theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
      </button>
    </nav>
  </div>
</header>

<main>
  <section class="event-hero">
    <div class="wrap event-hero-grid">
      <div>
        <a class="event-back" href="/">← Volver al inicio</a>
        <div class="event-status-line">
          <span class="event-status" data-event-status>${escapeHtml(data.status)}</span>
          <span class="event-updated">Actualizado el ${escapeHtml(formatDate(data.updatedAt))}</span>
        </div>
        <h1>${escapeHtml(data.heroTitle.line)} <em>${escapeHtml(data.heroTitle.emphasis)}</em></h1>
        <p class="event-deck">${escapeHtml(data.intro)}</p>
        <div class="event-actions">
          <a class="event-btn" href="#directo">Ver la emisión</a>
          <a class="event-btn event-btn-secondary" href="#anuncios">Seguir los anuncios</a>
        </div>
      </div>
      <a class="event-poster" href="${escapeHtml(data.streamUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir la emisión oficial de ${escapeHtml(data.title)} en YouTube">
        <img src="${escapeHtml(data.heroImage)}" alt="${escapeHtml(data.heroImageAlt)}">
        <span class="event-poster-label"><span>Emisión oficial</span><strong>${escapeHtml(data.dateLabel)}</strong></span>
      </a>
    </div>
  </section>

  <div class="wrap event-countdown-wrap">
    <div class="event-countdown" data-event-countdown="${escapeHtml(data.startAt)}">
      <div class="event-countdown-copy"><span>Comienza en</span><strong>${escapeHtml(data.countdownTitle)}</strong><small>${escapeHtml(data.countdownTimeLabel)} · <span data-event-local-time>Tu hora local</span></small></div>
      <div class="event-countdown-unit"><b data-event-days>00</b><span>Días</span></div>
      <div class="event-countdown-unit"><b data-event-hours>00</b><span>Horas</span></div>
      <div class="event-countdown-unit"><b data-event-minutes>00</b><span>Min</span></div>
      <div class="event-countdown-unit"><b data-event-seconds>00</b><span>Seg</span></div>
    </div>
  </div>

  <div class="wrap event-main">
    <nav class="event-nav" aria-label="Secciones del especial">
      <a href="#anuncios">Anuncios</a><a href="#confirmados">Confirmados</a><a href="#directo">Emisión</a><a href="#fuentes">Fuentes</a>
    </nav>

    <section class="event-section" id="anuncios">
      <div class="event-section-heading reveal">
        <div><span class="event-kicker">Cobertura en directo</span><h2>Todos los anuncios de la gala</h2><p>Las novedades aparecerán en orden conforme se confirmen durante la emisión.</p></div>
        <div class="event-total"><b data-event-visible-total>${data.announcements.length}</b><span>Anuncios</span></div>
      </div>
${filters ? `      ${filters}\n` : ""}      <div class="event-timeline">
        ${announcements || `<div class="event-live-empty reveal"><b>↻</b><div><strong>La cobertura comenzará con la gala</strong><p>Esta sección se llenará con los anuncios, fechas y tráilers confirmados durante ${escapeHtml(data.shortTitle)}.</p></div></div>`}
      </div>
    </section>

    <section class="event-section" id="confirmados">
      <div class="event-section-heading reveal"><div><span class="event-kicker">Antes de empezar</span><h2>Juegos con presencia confirmada</h2><p>Una selección inicial para saber qué buscar durante la gala, separada de cualquier rumor o predicción.</p></div><div class="event-total"><b>${data.appearances.length}</b><span>Confirmados</span></div></div>
      <div class="event-appearances">${appearances}</div>
    </section>

    <section class="event-section" id="directo">
      <div class="event-section-heading reveal"><div><span class="event-kicker">Retransmisión oficial</span><h2>Ver ${escapeHtml(data.shortTitle)}</h2><p>La emisión oficial puede verse sin salir de la cobertura.</p></div></div>
      <div class="event-watch-grid reveal">
        <div class="event-stream"><div class="event-stream-frame"><iframe src="https://www.youtube-nocookie.com/embed/${escapeHtml(data.streamYoutubeId)}?rel=0" title="Retransmisión oficial de ${escapeHtml(data.title)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div></div>
        <aside class="event-watch-card"><h3>Horarios clave</h3><dl class="event-watch-list">${schedule}</dl><div class="event-editorial-note">${escapeHtml(data.editorialNote)}</div></aside>
      </div>
    </section>

    <section class="event-section" id="fuentes">
      <div class="event-section-heading reveal"><div><span class="event-kicker">Procedencia</span><h2>Fuentes de la cobertura</h2><p>La página distingue los anuncios oficiales de la información previa publicada por medios solventes.</p></div></div>
      <div class="event-sources reveal">${sources}</div>
    </section>
  </div>
</main>

<footer><div class="footer-inner"><span>© 2026 Final Secreto</span></div></footer>
<script src="/js/main.js?v=20260730-2"></script>
<script src="/js/event-hub.js?v=20260823-1"></script>
</body>
</html>
`;
}

await mkdir(OUTPUT_DIR, { recursive: true });
const files = (await readdir(DATA_DIR)).filter((file) => file.endsWith(".json") && !file.startsWith("_"));
for (const file of files) {
  const data = JSON.parse(await readFile(path.join(DATA_DIR, file), "utf8"));
  await writeFile(path.join(OUTPUT_DIR, `${data.id}.html`), page(data), "utf8");
  console.log(`${data.id}: ${data.appearances.length} presencias y ${data.announcements.length} anuncios`);
}

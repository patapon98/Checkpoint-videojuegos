(function () {
  const news = Array.isArray(window.MODERLODE_NEWS) ? window.MODERLODE_NEWS : [];
  const locale = { es: "es-ES", en: "en-GB" };

  function text(value, lang) {
    if (typeof value === "string") return value;
    return value?.[lang] || value?.es || "";
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(value, lang) {
    return new Intl.DateTimeFormat(locale[lang] || locale.es, {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC"
    }).format(new Date(value + "T12:00:00Z"));
  }

  /* Solo las noticias con tráiler propio (anuncios, fechas, lanzamientos) lo incluyen. */
  function trailerLink(item, lang) {
    if (!item.trailer?.url) return "";
    const label = text(item.trailer.label, lang) || (lang === "en" ? "Watch trailer" : "Ver tráiler");
    const title = text(item.title, lang);
    const aria = lang === "en"
      ? `Watch the official ${title} trailer on YouTube`
      : `Ver el tráiler oficial de ${title} en YouTube`;
    return `
      <a class="news-trailer" href="${escapeHTML(item.trailer.url)}" target="_blank" rel="noopener noreferrer"
         aria-label="${escapeHTML(aria)}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z"/></svg>
        <span>${escapeHTML(label)}</span>
      </a>`;
  }

  function sourceLinks(item, lang, compact) {
    const label = lang === "en" ? "Sources:" : "Fuentes:";
    const links = item.sources.map(source => `
      <a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer"
         aria-label="${escapeHTML(text(source.type, lang))}. ${escapeHTML(source.label)}">
        <span>${escapeHTML(source.label)}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M10 14 19 5M19 14v5H5V5h5"/></svg>
      </a>`).join("");
    return `<div class="news-sources${compact ? " compact" : ""}"><b>${label}</b>${links}${trailerLink(item, lang)}</div>`;
  }

  function latestBadge(item, lang) {
    if (!item.latest) return "";
    return `<span class="news-latest"><i aria-hidden="true"></i>${lang === "en" ? "Breaking" : "Última hora"}</span>`;
  }

  function featuredCard(item, lang) {
    const updated = item.updated
      ? `<span>${lang === "en" ? "Updated" : "Actualizado"} ${formatDate(item.updated, lang)}</span>`
      : "";
    return `
      <article class="news-lead news-tone-${escapeHTML(item.tone)}">
        <div class="news-lead-signal" aria-hidden="true">
          <span>${escapeHTML(text(item.category, lang))}</span>
          <strong>${lang === "en" ? "ESSENTIAL" : "ESENCIAL"}</strong>
        </div>
        <div class="news-lead-copy">
          <div class="news-meta">
            <span class="news-category">${escapeHTML(text(item.category, lang))}</span>
            ${latestBadge(item, lang)}
            <time datetime="${item.date}">${formatDate(item.date, lang)}</time>
            ${updated}
          </div>
          <h3>${escapeHTML(text(item.title, lang))}</h3>
          <p>${escapeHTML(text(item.summary, lang))}</p>
          <div class="news-why">
            <b>${lang === "en" ? "Why it matters" : "Por qué importa"}</b>
            <span>${escapeHTML(text(item.why, lang))}</span>
          </div>
          ${sourceLinks(item, lang, false)}
        </div>
      </article>`;
  }

  function briefCard(item, lang) {
    return `
      <article class="news-brief">
        <div class="news-meta">
          <span class="news-category">${escapeHTML(text(item.category, lang))}</span>
          ${latestBadge(item, lang)}
          <time datetime="${item.date}">${formatDate(item.date, lang)}</time>
        </div>
        <h3>${escapeHTML(text(item.title, lang))}</h3>
        <p>${escapeHTML(text(item.summary, lang))}</p>
        <div class="news-brief-why">
          <b>${lang === "en" ? "Why it matters" : "Por qué importa"}</b>
          ${escapeHTML(text(item.why, lang))}
        </div>
        ${sourceLinks(item, lang, true)}
      </article>`;
  }

  function archiveCard(item, lang) {
    const updated = item.updated
      ? `<span>${lang === "en" ? "Updated" : "Actualizado"} ${formatDate(item.updated, lang)}</span>`
      : "";
    return `
      <article class="news-archive-card reveal" id="${escapeHTML(item.id)}">
        <div class="news-archive-date">
          ${latestBadge(item, lang)}
          <time datetime="${item.date}">${formatDate(item.date, lang)}</time>
          ${updated}
        </div>
        <div class="news-archive-body">
          <span class="news-category">${escapeHTML(text(item.category, lang))}</span>
          <h2>${escapeHTML(text(item.title, lang))}</h2>
          <p>${escapeHTML(text(item.summary, lang))}</p>
          <div class="news-why">
            <b>${lang === "en" ? "Why it matters" : "Por qué importa"}</b>
            <span>${escapeHTML(text(item.why, lang))}</span>
          </div>
          ${sourceLinks(item, lang, false)}
        </div>
      </article>`;
  }

  function tickerCopy(item, lang) {
    const copy = {
      "god-of-war-laufey-fecha": {
        es: ["God of War Laufey", " llegará a PS5 el 16 de febrero de 2027"],
        en: ["God of War Laufey", " comes to PS5 on February 16, 2027"]
      },
      "playstation-fin-formato-fisico": {
        es: ["PlayStation", " dejará de producir discos para nuevos juegos en 2028"],
        en: ["PlayStation", " will stop producing discs for new games in 2028"]
      },
      "xbox-retrocompatibilidad-pc": {
        es: ["Xbox", " estrena la retrocompatibilidad de sus clásicos en PC"],
        en: ["Xbox", " brings backward-compatible classics to PC"]
      },
      "xbox-reestructuracion-despidos": {
        es: ["Industria", " Xbox recortará 3.200 empleos durante su reestructuración"],
        en: ["Industry", " Xbox will cut 3,200 jobs in its restructuring"]
      }
    };
    const parts = copy[item.id]?.[lang];
    if (!parts) return escapeHTML(text(item.title, lang));
    return `<b>${escapeHTML(parts[0])}</b>${escapeHTML(parts[1])}`;
  }

  function renderNews(lang) {
    const selectedLang = lang === "en" ? "en" : "es";
    const featured = news.find(item => item.featured) || news[0];
    const rest = news
      .filter(item => item !== featured && item.home !== false)
      .sort((a, b) => b.date.localeCompare(a.date));

    const home = document.getElementById("newsHome");
    if (home && featured) {
      home.innerHTML = `
        ${featuredCard(featured, selectedLang)}
        <div class="news-brief-grid">${rest.slice(0, 4).map(item => briefCard(item, selectedLang)).join("")}</div>`;
    }

    const archive = document.getElementById("newsArchive");
    if (archive) {
      const ordered = [...news].sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return b.date.localeCompare(a.date);
      });
      archive.innerHTML = ordered.map(item => archiveCard(item, selectedLang)).join("");
    }

    const ticker = document.getElementById("ticker");
    if (ticker) {
      const tickerItems = news.filter(item => item.ticker);
      const tickerLinks = tickerItems.map(item =>
        `<a href="noticias.html#${escapeHTML(item.id)}">${tickerCopy(item, selectedLang)}</a>`
      ).join("");
      ticker.innerHTML = tickerLinks + tickerItems.map(item =>
        `<a href="noticias.html#${escapeHTML(item.id)}" aria-hidden="true" tabindex="-1">${tickerCopy(item, selectedLang)}</a>`
      ).join("");
    }
  }

  window.renderNews = renderNews;
  renderNews(document.documentElement.lang);
})();

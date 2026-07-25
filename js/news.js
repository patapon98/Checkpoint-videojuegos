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

  function sourceLinks(item, lang, compact) {
    const label = lang === "en" ? "Sources" : "Fuentes";
    const links = item.sources.map(source => `
      <a href="${escapeHTML(source.url)}" target="_blank" rel="noopener noreferrer"
         aria-label="${escapeHTML(text(source.type, lang))}. ${escapeHTML(source.label)}">
        <span>${escapeHTML(source.label)}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M10 14 19 5M19 14v5H5V5h5"/></svg>
      </a>`).join("");
    return `<div class="news-sources${compact ? " compact" : ""}"><b>${label}</b>${links}</div>`;
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
      <article class="news-archive-card" id="${escapeHTML(item.id)}">
        <div class="news-archive-date">
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
  }

  window.renderNews = renderNews;
  renderNews(document.documentElement.lang);
})();

(() => {
  const gameId = document.body.dataset.gameId;
  const dataUrl = `/data/game-hubs/${gameId}.json`;
  const formatDate = (value) => new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
  const text = (value = '') => String(value);
  const escapeHtml = (value = '') => text(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));

  function renderFacts(data) {
    const facts = [
      ['Lanzamiento', formatDate(data.releaseDate)],
      ['Plataforma', data.platforms.join(' · ')],
      ['Desarrollador', data.developer],
      ['Género', data.genre]
    ];
    document.querySelector('#gameFacts').innerHTML = facts.map(([label, value]) => `<div class="game-fact"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');
    document.querySelector('#quickFacts').innerHTML = [
      ['Estado', data.status], ['Fecha', formatDate(data.releaseDate)], ['Plataforma', data.platforms.join(' · ')], ['Editora', data.publisher]
    ].map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
  }

  function renderLists(data) {
    document.querySelector('#confirmedList').innerHTML = data.confirmed.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    document.querySelector('#pendingList').innerHTML = data.pending.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  }

  function renderGallery(data) {
    const gallery = document.querySelector('#gameGallery');
    const images = [data.rawg.backgroundImage, ...(data.rawg.screenshots || [])].filter(Boolean).filter((url, index, list) => list.indexOf(url) === index);
    if (!images.length) return;
    gallery.innerHTML = images.slice(0, 7).map((url, index) => `<figure><img src="${escapeHtml(url)}" alt="${escapeHtml(data.title)} — imagen ${index + 1}" loading="${index ? 'lazy' : 'eager'}" decoding="async"></figure>`).join('');
    const hero = document.querySelector('#heroMedia');
    hero.style.backgroundImage = `linear-gradient(135deg, rgba(12,13,16,.22), rgba(12,13,16,.08)), url("${images[0].replace(/"/g, '%22')}")`;
    const og = document.querySelector('meta[property="og:image"]') || document.head.appendChild(Object.assign(document.createElement('meta'), { property: 'og:image' }));
    og.setAttribute('content', images[0]);
  }

  function renderSources(data) {
    document.querySelector('#sourceList').innerHTML = data.sources.map((source) => `<a class="source-item" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(source.label)}</strong><span>${escapeHtml(source.type)} ↗</span></a>`).join('');
    document.querySelector('#updatedAt').textContent = formatDate(data.updatedAt);
  }

  function renderNews() {
    const container = document.querySelector('#relatedNews');
    const terms = ['god of war laufey', 'laufey', 'faye'];
    const news = (window.FINALSECRETO_NEWS || []).filter((item) => {
      const haystack = [item.id, item.title?.es, item.summary?.es, item.why?.es, item.ticker?.keyword?.es, item.ticker?.copy?.es].filter(Boolean).join(' ').toLowerCase();
      return terms.some((term) => haystack.includes(term));
    }).sort((a, b) => new Date(b.updated || b.date) - new Date(a.updated || a.date));
    if (!news.length) {
      container.innerHTML = '<div class="gallery-placeholder">Todavía no hay noticias relacionadas publicadas.</div>';
      return;
    }
    container.innerHTML = news.map((item) => {
      const href = item.article?.url || '/noticias';
      return `<a class="related-news-card" href="${escapeHtml(href)}"><time class="related-news-date" datetime="${escapeHtml(item.date)}">${escapeHtml(formatDate(item.date))}</time><div><h3>${escapeHtml(item.title.es)}</h3><p>${escapeHtml(item.summary.es)}</p></div><span class="related-news-arrow" aria-hidden="true">→</span></a>`;
    }).join('');
  }

  function startCountdown(releaseDate) {
    const target = new Date(`${releaseDate}T00:00:00+01:00`).getTime();
    const update = () => {
      const distance = target - Date.now();
      if (distance <= 0) {
        document.querySelector('#countdownText').textContent = 'Ya disponible';
        ['days', 'hours', 'minutes'].forEach((id) => { document.querySelector(`#${id}`).textContent = '0'; });
        return;
      }
      const days = Math.floor(distance / 86400000);
      const hours = Math.floor((distance % 86400000) / 3600000);
      const minutes = Math.floor((distance % 3600000) / 60000);
      document.querySelector('#days').textContent = days;
      document.querySelector('#hours').textContent = hours;
      document.querySelector('#minutes').textContent = minutes;
      document.querySelector('#countdownText').textContent = `Quedan ${days} días para el lanzamiento`;
    };
    update();
    window.setInterval(update, 60000);
  }

  function activateReveal() {
    const nodes = [...document.querySelectorAll('.reveal')];
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    nodes.forEach((node) => observer.observe(node));
  }

  fetch(dataUrl)
    .then((response) => { if (!response.ok) throw new Error('No se pudieron cargar los datos'); return response.json(); })
    .then((data) => {
      document.querySelector('#gameStatus').textContent = data.status;
      document.querySelector('#gamePremise').textContent = data.premise;
      document.querySelector('#wishlistButton').href = data.storeUrl;
      document.querySelector('#trailerButton').href = data.trailerUrl;
      renderFacts(data); renderLists(data); renderGallery(data); renderSources(data); renderNews(); startCountdown(data.releaseDate);
    })
    .catch(() => {
      document.querySelector('#gamePremise').textContent = 'No ha sido posible cargar la información actualizada. Consulta de nuevo en unos minutos.';
      renderNews(); startCountdown('2027-02-16');
    })
    .finally(activateReveal);
})();

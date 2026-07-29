(() => {
  const gameId = document.body.dataset.gameId;
  const dataUrl = `/data/game-hubs/${gameId}.json`;
  const formatDate = (value) => new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(`${value}T12:00:00`));
  const text = (value = '') => String(value);
  const escapeHtml = (value = '') => text(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));

  function relatedNews() {
    const terms = ['god of war laufey', 'laufey', 'faye'];
    return (window.FINALSECRETO_NEWS || []).filter((item) => {
      const haystack = [
        item.id,
        item.title?.es,
        item.summary?.es,
        item.why?.es,
        item.ticker?.keyword?.es,
        item.ticker?.copy?.es
      ].filter(Boolean).join(' ').toLowerCase();
      return terms.some((term) => haystack.includes(term));
    }).sort((a, b) => new Date(b.updated || b.date) - new Date(a.updated || a.date));
  }

  function renderFacts(data) {
    const facts = [
      ['Lanzamiento', formatDate(data.releaseDate)],
      ['Plataforma', data.platforms.join(' · ')],
      ['Desarrollador', data.developer],
      ['Género', data.genre]
    ];
    document.querySelector('#gameFacts').innerHTML = facts.map(([label, value]) =>
      `<div class="game-fact"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`
    ).join('');
    document.querySelector('#quickFacts').innerHTML = [
      ['Estado', data.status],
      ['Fecha', formatDate(data.releaseDate)],
      ['Plataforma', data.platforms.join(' · ')],
      ['Editora', data.publisher]
    ].map(([label, value]) =>
      `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`
    ).join('');
  }

  function renderLists(data) {
    document.querySelector('#confirmedList').innerHTML = data.confirmed.map((item) =>
      `<li>${escapeHtml(item)}</li>`
    ).join('');
    document.querySelector('#pendingList').innerHTML = data.pending.map((item) =>
      `<li>${escapeHtml(item)}</li>`
    ).join('');
  }

  function renderGallery(data) {
    const gallery = document.querySelector('#gameGallery');
    const images = Array.isArray(data.gallery) ? data.gallery.filter((image) => image?.src) : [];
    if (!images.length) {
      gallery.innerHTML = '<div class="gallery-placeholder">Todavía no hay imágenes oficiales disponibles.</div>';
      return;
    }
    gallery.innerHTML = images.map((image, index) => `
      <figure>
        <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt || `${data.title}, imagen ${index + 1}`)}"
             loading="${index ? 'lazy' : 'eager'}" decoding="async">
      </figure>`).join('');
  }

  function youtubeId(value = '') {
    const raw = text(value).trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
    try {
      const url = new URL(raw);
      if (url.hostname.includes('youtu.be')) return url.pathname.split('/').filter(Boolean)[0] || '';
      if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/')[2] || '';
      if (url.pathname.startsWith('/embed/')) return url.pathname.split('/')[2] || '';
      return url.searchParams.get('v') || '';
    } catch {
      return '';
    }
  }

  function renderMedia(data, news) {
    const container = document.querySelector('#gameMedia');
    const media = [];
    const seen = new Set();
    const addVideo = (entry) => {
      const id = youtubeId(entry.videoId || entry.url || '');
      if (!id || seen.has(id)) return;
      seen.add(id);
      media.push({
        id,
        title: entry.title || `Vídeo oficial de ${data.title}`,
        label: entry.label || 'Vídeo oficial',
        publishedAt: entry.publishedAt || ''
      });
    };

    (data.media || []).forEach(addVideo);
    news.forEach((item) => {
      if (!item.trailer?.url) return;
      addVideo({
        url: item.trailer.url,
        title: item.title?.es || `Vídeo de ${data.title}`,
        label: item.trailer.label?.es || 'Vídeo relacionado',
        publishedAt: item.date
      });
    });

    if (!media.length) {
      container.innerHTML = '<div class="gallery-placeholder">Todavía no hay vídeos oficiales disponibles.</div>';
      return;
    }

    container.innerHTML = media.map((item) => `
      <article class="game-media-card">
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
            ${item.publishedAt ? `<time datetime="${escapeHtml(item.publishedAt)}">${escapeHtml(formatDate(item.publishedAt))}</time>` : ''}
          </div>
          <a href="https://www.youtube.com/watch?v=${escapeHtml(item.id)}" target="_blank" rel="noopener noreferrer">Ver en YouTube ↗</a>
        </div>
      </article>`).join('');
  }

  function renderSources(data) {
    document.querySelector('#sourceList').innerHTML = data.sources.map((source) =>
      `<a class="source-item" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(source.label)}</strong><span>${escapeHtml(source.type)} ↗</span></a>`
    ).join('');
    document.querySelector('#updatedAt').textContent = formatDate(data.updatedAt);
  }

  function renderNews(news) {
    const container = document.querySelector('#relatedNews');
    if (!news.length) {
      container.innerHTML = '<div class="gallery-placeholder">Todavía no hay noticias relacionadas publicadas.</div>';
      return;
    }
    container.innerHTML = news.map((item) => {
      const href = `/noticias.html#${encodeURIComponent(item.id)}`;
      return `<a class="related-news-card" href="${href}"><time class="related-news-date" datetime="${escapeHtml(item.date)}">${escapeHtml(formatDate(item.date))}</time><div><h3>${escapeHtml(item.title.es)}</h3><p>${escapeHtml(item.summary.es)}</p></div><span class="related-news-arrow" aria-hidden="true">→</span></a>`;
    }).join('');
  }

  function startCountdown(releaseDate) {
    const target = new Date(`${releaseDate}T00:00:00+01:00`).getTime();
    const update = () => {
      const distance = target - Date.now();
      if (distance <= 0) {
        document.querySelector('#countdownText').textContent = 'Ya disponible';
        ['days', 'hours', 'minutes'].forEach((id) => {
          document.querySelector(`#${id}`).textContent = '0';
        });
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
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.08 });
    nodes.forEach((node) => observer.observe(node));
  }

  fetch(dataUrl)
    .then((response) => {
      if (!response.ok) throw new Error('No se pudieron cargar los datos');
      return response.json();
    })
    .then((data) => {
      const news = relatedNews();
      document.querySelector('#gameStatus').textContent = data.status;
      document.querySelector('#gamePremise').textContent = data.premise;
      document.querySelector('#wishlistButton').href = data.storeUrl;
      if (data.heroImage) {
        const hero = document.querySelector('#heroMedia');
        hero.style.backgroundImage = `linear-gradient(135deg, rgba(12,13,16,.2), rgba(12,13,16,.06)), url("${data.heroImage.replace(/"/g, '%22')}")`;
      }
      renderFacts(data);
      renderLists(data);
      renderMedia(data, news);
      renderGallery(data);
      renderSources(data);
      renderNews(news);
      startCountdown(data.releaseDate);
    })
    .catch(() => {
      document.querySelector('#gamePremise').textContent = 'No ha sido posible cargar la información actualizada. Consulta de nuevo en unos minutos.';
      const news = relatedNews();
      renderNews(news);
      renderMedia({ title: 'God of War Laufey', media: [] }, news);
      startCountdown('2027-02-16');
    })
    .finally(activateReveal);
})();

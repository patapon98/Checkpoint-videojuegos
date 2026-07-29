(() => {
  const body = document.body;
  const gameId = body.dataset.gameId;
  const dataUrl = `/data/game-hubs/${gameId}.json`;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  function relatedNews(data = {}) {
    const terms = (Array.isArray(data.newsTerms) && data.newsTerms.length ? data.newsTerms : [data.title])
      .filter(Boolean)
      .map((term) => text(term).toLocaleLowerCase('es'));

    return (window.FINALSECRETO_NEWS || []).filter((item) => {
      const haystack = [
        item.id,
        item.title?.es,
        item.summary?.es,
        item.why?.es,
        item.ticker?.keyword?.es,
        item.ticker?.copy?.es
      ].filter(Boolean).join(' ').toLocaleLowerCase('es');
      return terms.some((term) => haystack.includes(term));
    }).sort((a, b) => new Date(b.updated || b.date) - new Date(a.updated || a.date));
  }

  function renderFacts(data) {
    const facts = [
      ['Lanzamiento', formatDate(data.releaseDate)],
      ['Género', data.genre],
      ['Plataformas', data.platforms.join(' · ')],
      ['Desarrolladora', data.developer]
    ];

    document.querySelector('#gameFacts').innerHTML = facts.map(([label, value]) =>
      `<div class="game-fact"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`
    ).join('');

    document.querySelector('#quickFacts').innerHTML = [
      ['Fecha de lanzamiento', formatDate(data.releaseDate)],
      ['Género', data.genre],
      ['Plataformas', data.platforms.join(' · ')],
      ['Desarrolladora', data.developer],
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

  function renderChanges(data) {
    const container = document.querySelector('#gameChangeList');
    if (!container) return;

    const changes = Array.isArray(data.changes) ? data.changes : [];
    if (!changes.length) {
      container.innerHTML = '<li class="game-change-item"><div><h3>Sin cambios registrados</h3><p>La ficha conserva su primera versión editorial.</p></div></li>';
      return;
    }

    container.innerHTML = changes.map((item) =>
      `<li class="game-change-item"><time datetime="${escapeHtml(item.date)}">${escapeHtml(formatDate(item.date))}</time><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div></li>`
    ).join('');
  }

  function createGalleryLightbox(images) {
    const dialog = document.createElement('dialog');
    dialog.className = 'game-gallery-lightbox';
    dialog.setAttribute('aria-label', 'Imagen ampliada de la galería');
    dialog.innerHTML = `
      <button class="game-gallery-lightbox-close" type="button" aria-label="Cerrar imagen ampliada">×</button>
      <button class="game-gallery-lightbox-nav game-gallery-lightbox-prev" type="button" aria-label="Imagen anterior">←</button>
      <figure class="game-gallery-lightbox-frame">
        <img class="game-gallery-lightbox-image" alt="">
        <figcaption class="game-gallery-lightbox-caption"></figcaption>
      </figure>
      <button class="game-gallery-lightbox-nav game-gallery-lightbox-next" type="button" aria-label="Imagen siguiente">→</button>
      <span class="game-gallery-lightbox-count" aria-live="polite"></span>`;
    document.body.appendChild(dialog);

    const image = dialog.querySelector('.game-gallery-lightbox-image');
    const caption = dialog.querySelector('.game-gallery-lightbox-caption');
    const count = dialog.querySelector('.game-gallery-lightbox-count');
    let current = 0;

    const show = (index) => {
      current = (index + images.length) % images.length;
      const item = images[current];
      image.src = item.src;
      image.alt = item.alt;
      caption.textContent = item.alt;
      count.textContent = `${current + 1} / ${images.length}`;
    };

    const close = () => {
      if (dialog.open && typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    };

    dialog.querySelector('.game-gallery-lightbox-close').addEventListener('click', close);
    dialog.querySelector('.game-gallery-lightbox-prev').addEventListener('click', () => show(current - 1));
    dialog.querySelector('.game-gallery-lightbox-next').addEventListener('click', () => show(current + 1));

    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) close();
    });

    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        show(current - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        show(current + 1);
      }
    });

    dialog.addEventListener('close', () => document.body.classList.remove('game-lightbox-open'));

    return {
      open(index) {
        show(index);
        document.body.classList.add('game-lightbox-open');
        if (typeof dialog.showModal === 'function') dialog.showModal();
        else dialog.setAttribute('open', '');
      }
    };
  }

  function renderGallery(data) {
    const gallery = document.querySelector('#gameGallery');
    const images = Array.isArray(data.gallery)
      ? data.gallery.filter((item) => item?.src).map((item, index) => ({
        src: item.src,
        alt: item.alt || `${data.title}, imagen ${index + 1}`
      }))
      : [];

    if (!images.length) {
      gallery.innerHTML = '<div class="gallery-placeholder">Todavía no hay imágenes oficiales disponibles.</div>';
      return;
    }

    gallery.innerHTML = `
      <div class="game-gallery-slider" data-gallery-slider>
        <div class="game-gallery-stage">
          <button class="game-gallery-arrow game-gallery-prev" type="button" aria-label="Imagen anterior">←</button>
          <div class="game-gallery-viewport">
            <div class="game-gallery-track">
              ${images.map((item, index) => `
                <button class="game-gallery-slide" type="button" data-gallery-open="${index}"
                        aria-label="Ampliar imagen ${index + 1} de ${images.length}">
                  <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.alt)}"
                       loading="${index ? 'lazy' : 'eager'}" decoding="async">
                  <span class="game-gallery-zoom-hint" aria-hidden="true">⌕ Ampliar</span>
                </button>`).join('')}
            </div>
          </div>
          <button class="game-gallery-arrow game-gallery-next" type="button" aria-label="Imagen siguiente">→</button>
        </div>
        <div class="game-gallery-controls">
          <span class="game-gallery-counter" aria-live="polite">1 / ${images.length}</span>
          <div class="game-gallery-thumbs" aria-label="Seleccionar imagen">
            ${images.map((item, index) => `
              <button class="game-gallery-thumb${index === 0 ? ' active' : ''}" type="button"
                      data-gallery-thumb="${index}" aria-label="Mostrar imagen ${index + 1}"
                      aria-pressed="${index === 0}">
                <img src="${escapeHtml(item.src)}" alt="" loading="lazy" decoding="async">
              </button>`).join('')}
          </div>
        </div>
      </div>`;

    const viewport = gallery.querySelector('.game-gallery-viewport');
    const track = gallery.querySelector('.game-gallery-track');
    const slides = [...gallery.querySelectorAll('.game-gallery-slide')];
    const thumbs = [...gallery.querySelectorAll('.game-gallery-thumb')];
    const counter = gallery.querySelector('.game-gallery-counter');
    const lightbox = createGalleryLightbox(images);
    let current = 0;
    let pointer = null;
    let suppressClickUntil = 0;

    const show = (index, scrollThumb = true) => {
      current = (index + images.length) % images.length;
      track.classList.remove('is-dragging');
      track.style.transform = `translate3d(-${current * 100}%,0,0)`;
      counter.textContent = `${current + 1} / ${images.length}`;

      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === current;
        slide.setAttribute('aria-hidden', String(!active));
        slide.tabIndex = active ? 0 : -1;
      });

      thumbs.forEach((thumb, thumbIndex) => {
        const active = thumbIndex === current;
        thumb.classList.toggle('active', active);
        thumb.setAttribute('aria-pressed', String(active));
      });

      if (scrollThumb) {
        const thumb = thumbs[current];
        const targetLeft = thumb.offsetLeft - (thumb.parentElement.clientWidth - thumb.offsetWidth) / 2;
        thumb.parentElement.scrollTo({
          left: Math.max(0, targetLeft),
          behavior: reducedMotion ? 'auto' : 'smooth'
        });
      }
    };

    gallery.querySelector('.game-gallery-prev').addEventListener('click', () => show(current - 1));
    gallery.querySelector('.game-gallery-next').addEventListener('click', () => show(current + 1));
    thumbs.forEach((thumb, index) => thumb.addEventListener('click', () => show(index)));
    slides.forEach((slide, index) => slide.addEventListener('click', () => {
      if (performance.now() < suppressClickUntil) return;
      lightbox.open(index);
    }));

    viewport.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      pointer = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        startedAt: performance.now(),
        axis: null
      };
    });

    viewport.addEventListener('pointermove', (event) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      const deltaX = event.clientX - pointer.x;
      const deltaY = event.clientY - pointer.y;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (!pointer.axis) {
        if (Math.max(absX, absY) < 8) return;
        pointer.axis = absX > absY * 1.08 ? 'x' : 'y';
      }
      if (pointer.axis !== 'x') return;

      event.preventDefault();
      track.classList.add('is-dragging');
      const resistance = (current === 0 && deltaX > 0) || (current === images.length - 1 && deltaX < 0)
        ? 0.3
        : 1;
      track.style.transform = `translate3d(calc(-${current * 100}% + ${Math.round(deltaX * resistance)}px),0,0)`;
    }, { passive: false });

    const finishPointer = (event, cancelled) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      const state = pointer;
      pointer = null;

      if (state.axis !== 'x') return;
      const deltaX = event.clientX - state.x;
      const elapsed = Math.max(1, performance.now() - state.startedAt);
      const velocity = deltaX / elapsed;
      const threshold = Math.min(100, viewport.clientWidth * 0.18);
      const advance = !cancelled && (Math.abs(deltaX) >= threshold || Math.abs(velocity) >= 0.5);
      suppressClickUntil = performance.now() + 260;
      show(advance ? current + (deltaX < 0 ? 1 : -1) : current);
    };

    viewport.addEventListener('pointerup', (event) => finishPointer(event, false));
    viewport.addEventListener('pointercancel', (event) => finishPointer(event, true));
    show(0, false);
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

    const updated = document.querySelector('#updatedAt');
    updated.textContent = formatDate(data.updatedAt);
    updated.setAttribute('datetime', data.updatedAt);
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

  function activateSectionNavigation() {
    const nav = document.querySelector('.game-section-nav');
    const links = [...(nav?.querySelectorAll('a[href^="#"]') || [])];
    const sections = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    if (!nav || !links.length || !sections.length) return;

    let activeId = '';

    const setActive = (id) => {
      if (id === activeId) return;
      activeId = id;

      links.forEach((link) => {
        const active = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('active', active);
        if (active) {
          link.setAttribute('aria-current', 'location');
          const targetLeft = link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2;
          nav.scrollTo({
            left: Math.max(0, targetLeft),
            behavior: reducedMotion ? 'auto' : 'smooth'
          });
        } else {
          link.removeAttribute('aria-current');
        }
      });
    };

    let frame = 0;
    const update = () => {
      const activationLine = nav.getBoundingClientRect().bottom + 28;
      let active = sections[0].id;
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= activationLine) active = section.id;
      });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
        active = sections.at(-1).id;
      }
      setActive(active);
      frame = 0;
    };

    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    update();
  }

  function activateReveal() {
    const nodes = [...document.querySelectorAll('.reveal')];
    if (reducedMotion || !('IntersectionObserver' in window)) {
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

  activateSectionNavigation();

  fetch(dataUrl)
    .then((response) => {
      if (!response.ok) throw new Error('No se pudieron cargar los datos');
      return response.json();
    })
    .then((data) => {
      const news = relatedNews(data);
      document.querySelector('#gameStatus').textContent = data.status;
      document.querySelector('#gamePremise').textContent = data.premise;
      document.querySelector('#gameContext').textContent = data.context || '';
      document.querySelector('#wishlistButton').href = data.storeUrl;

      if (data.heroImage) {
        const hero = document.querySelector('#heroMedia');
        hero.style.backgroundImage = `linear-gradient(135deg, rgba(12,13,16,.2), rgba(12,13,16,.06)), url("${data.heroImage.replace(/"/g, '%22')}")`;
      }

      renderFacts(data);
      renderLists(data);
      renderChanges(data);
      renderMedia(data, news);
      renderGallery(data);
      renderSources(data);
      renderNews(news);
      startCountdown(data.releaseDate);
    })
    .catch(() => {
      document.querySelector('#gamePremise').textContent = 'No ha sido posible cargar la información actualizada. Consulta de nuevo en unos minutos.';
      renderNews([]);
      renderMedia({ title: body.dataset.gameTitle || 'el juego', media: [] }, []);
      startCountdown(body.dataset.releaseDate || '2027-02-16');
    })
    .finally(activateReveal);
})();

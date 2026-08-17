(() => {
  const grid = document.getElementById('allReviews');
  const filters = document.getElementById('revFilters');
  const search = document.getElementById('reviewSearch');
  const clearSearch = document.getElementById('reviewSearchClear');
  const sort = document.getElementById('reviewSort');
  const resultCount = document.getElementById('reviewResultCount');
  const emptyState = document.getElementById('reviewEmpty');
  const reset = document.getElementById('reviewReset');
  const pagination = document.getElementById('reviewPagination');
  const pageList = document.getElementById('reviewPageList');
  const prevPage = document.getElementById('reviewPrev');
  const nextPage = document.getElementById('reviewNext');

  if (!grid || !filters || !search || !sort) return;

  if (!grid.querySelector('a[href="/resenas/scritchy-scratchy"]')) {
    grid.insertAdjacentHTML('afterbegin', `
      <a class="card" data-tilt data-plat="pc" href="/resenas/scritchy-scratchy">
        <div class="card-art art-24">
          <img src="img/scritchy%20scratch/portada.png" alt="Scritchy Scratchy" loading="lazy">
          <div class="date-pill"><b>17</b><span>Ago 26</span></div>
          <div class="ring" style="--target:40"><svg width="52" height="52"><circle cx="26" cy="26" r="24"/><circle class="track" cx="26" cy="26" r="20"/><circle class="bar" cx="26" cy="26" r="20"/></svg><span class="num">68</span></div>
        </div>
        <div class="card-body">
          <div class="meta">Incremental · PC / macOS / iOS / Android</div>
          <h3>Scritchy Scratchy</h3>
          <p>Un rasca y gana incremental con boletos distintos, prestigio adictivo y suficiente variedad para destacar dentro del género.</p>
          <span class="read"><u>Leer reseña</u></span>
        </div>
      </a>
    `);
  }

  const PER_PAGE = 9;
  const cards = [...grid.querySelectorAll('.card')];
  let activePlatform = 'all';
  let currentPage = 1;

  const normalize = value => value
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const scoreOf = card => Number(card.querySelector('.num')?.textContent) || 0;
  const titleOf = card => card.querySelector('h3')?.textContent.trim() || '';

  cards.forEach((card, index) => {
    card.dataset.originalOrder = String(index);
  });

  const updateStats = () => {
    const scores = cards.map(scoreOf).filter(Number.isFinite);
    if (!scores.length) return;

    const bestScore = Math.max(...scores);
    const bestCard = cards.find(card => scoreOf(card) === bestScore);
    const average = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);

    document.getElementById('reviewTotal').textContent = String(cards.length);
    document.getElementById('reviewAverage').textContent = String(average);
    document.getElementById('reviewBest').textContent = String(bestScore);
    document.getElementById('reviewBestLabel').textContent = `Mejor nota: ${titleOf(bestCard)}`;
  };

  const matchesFilters = (card, query) => {
    const platformMatch = activePlatform === 'all'
      || card.dataset.plat.split(' ').includes(activePlatform);
    const searchableText = normalize([
      titleOf(card),
      card.querySelector('.meta')?.textContent || '',
      card.querySelector('p')?.textContent || ''
    ].join(' '));
    return platformMatch && (!query || searchableText.includes(query));
  };

  // Con muchas páginas se condensa la tira dejando la primera, la última y
  // las contiguas a la actual, separadas por puntos suspensivos.
  const pageNumbers = total => {
    if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

    const wanted = [1, total, currentPage, currentPage - 1, currentPage + 1];
    const shown = [...new Set(wanted)]
      .filter(page => page >= 1 && page <= total)
      .sort((a, b) => a - b);

    return shown.flatMap((page, index) =>
      index && page - shown[index - 1] > 1 ? ['gap', page] : [page]
    );
  };

  const renderPagination = totalPages => {
    if (!pagination || !pageList) return;

    pagination.hidden = totalPages <= 1;
    pageList.textContent = '';
    if (totalPages <= 1) return;

    pageNumbers(totalPages).forEach(entry => {
      if (entry === 'gap') {
        const gap = document.createElement('span');
        gap.className = 'review-page-gap';
        gap.textContent = '…';
        gap.setAttribute('aria-hidden', 'true');
        pageList.appendChild(gap);
        return;
      }

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'review-page';
      button.textContent = String(entry);
      button.setAttribute('aria-label', `Página ${entry} de ${totalPages}`);
      if (entry === currentPage) button.setAttribute('aria-current', 'page');
      button.addEventListener('click', () => goToPage(entry));
      pageList.appendChild(button);
    });

    if (prevPage) prevPage.disabled = currentPage === 1;
    if (nextPage) nextPage.disabled = currentPage === totalPages;
  };

  const apply = () => {
    const query = normalize(search.value.trim());

    const orderedCards = [...cards].sort((a, b) => {
      if (sort.value === 'score') return scoreOf(b) - scoreOf(a);
      if (sort.value === 'title') return titleOf(a).localeCompare(titleOf(b), 'es', { sensitivity: 'base' });
      return Number(a.dataset.originalOrder) - Number(b.dataset.originalOrder);
    });

    const matched = orderedCards.filter(card => matchesFilters(card, query));
    const totalPages = Math.max(1, Math.ceil(matched.length / PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * PER_PAGE;
    const pageCards = matched.slice(start, start + PER_PAGE);
    const onPage = new Set(pageCards);

    // Las tarjetas de la página van primero en el DOM para que la cadencia de
    // entrada arranque siempre desde la primera posición de la rejilla.
    pageCards.forEach(card => grid.appendChild(card));
    orderedCards.forEach(card => {
      if (!onPage.has(card)) grid.appendChild(card);
    });

    cards.forEach(card => card.classList.toggle('hide', !onPage.has(card)));

    if (resultCount) {
      resultCount.textContent = `${matched.length} ${matched.length === 1 ? 'reseña encontrada' : 'reseñas encontradas'}`;
    }
    if (emptyState) emptyState.hidden = matched.length !== 0;
    if (clearSearch) clearSearch.hidden = search.value.length === 0;

    renderPagination(totalPages);
  };

  const goToPage = page => {
    if (page === currentPage) return;

    // Los botones de página se reconstruyen en cada render, así que hay que
    // devolver el foco para no dejar tirado a quien navega con el teclado.
    const previousFocus = document.activeElement;
    const cameFromPagination = pagination?.contains(previousFocus);

    currentPage = page;
    apply();

    if (cameFromPagination) {
      const stillUsable = previousFocus?.isConnected && !previousFocus.disabled;
      const target = stillUsable
        ? previousFocus
        : pageList?.querySelector('.review-page[aria-current="page"]');
      target?.focus();
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: grid.getBoundingClientRect().top + window.scrollY - 110,
      behavior: reduceMotion ? 'auto' : 'smooth'
    });
  };

  // Cualquier cambio de búsqueda, filtro u orden devuelve a la primera página.
  const applyFromFirstPage = () => {
    currentPage = 1;
    apply();
  };

  filters.addEventListener('click', event => {
    const button = event.target.closest('.pill-filter');
    if (!button) return;

    filters.querySelectorAll('.pill-filter').forEach(item => {
      const selected = item === button;
      item.classList.toggle('on', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    activePlatform = button.dataset.f;
    applyFromFirstPage();
  });

  search.addEventListener('input', applyFromFirstPage);
  sort.addEventListener('change', applyFromFirstPage);

  prevPage?.addEventListener('click', () => goToPage(currentPage - 1));
  nextPage?.addEventListener('click', () => goToPage(currentPage + 1));

  clearSearch?.addEventListener('click', () => {
    search.value = '';
    search.focus();
    applyFromFirstPage();
  });

  reset?.addEventListener('click', () => {
    search.value = '';
    sort.value = 'recent';
    activePlatform = 'all';
    filters.querySelectorAll('.pill-filter').forEach(item => {
      const selected = item.dataset.f === 'all';
      item.classList.toggle('on', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    applyFromFirstPage();
    search.focus();
  });

  updateStats();
  apply();
})();

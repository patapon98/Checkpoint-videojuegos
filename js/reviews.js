(() => {
  const grid = document.getElementById('allReviews');
  const filters = document.getElementById('revFilters');
  const search = document.getElementById('reviewSearch');
  const clearSearch = document.getElementById('reviewSearchClear');
  const sort = document.getElementById('reviewSort');
  const resultCount = document.getElementById('reviewResultCount');
  const emptyState = document.getElementById('reviewEmpty');
  const reset = document.getElementById('reviewReset');

  if (!grid || !filters || !search || !sort) return;

  const cards = [...grid.querySelectorAll('.card')];
  let activePlatform = 'all';

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

  const apply = () => {
    const query = normalize(search.value.trim());

    const orderedCards = [...cards].sort((a, b) => {
      if (sort.value === 'score') return scoreOf(b) - scoreOf(a);
      if (sort.value === 'title') return titleOf(a).localeCompare(titleOf(b), 'es', { sensitivity: 'base' });
      return Number(a.dataset.originalOrder) - Number(b.dataset.originalOrder);
    });

    orderedCards.forEach(card => grid.appendChild(card));

    let visible = 0;
    cards.forEach(card => {
      const platformMatch = activePlatform === 'all'
        || card.dataset.plat.split(' ').includes(activePlatform);
      const searchableText = normalize([
        titleOf(card),
        card.querySelector('.meta')?.textContent || '',
        card.querySelector('p')?.textContent || ''
      ].join(' '));
      const matches = platformMatch && (!query || searchableText.includes(query));

      card.classList.toggle('hide', !matches);
      if (matches) visible += 1;
    });

    if (resultCount) {
      resultCount.textContent = `${visible} ${visible === 1 ? 'reseña encontrada' : 'reseñas encontradas'}`;
    }
    if (emptyState) emptyState.hidden = visible !== 0;
    if (clearSearch) clearSearch.hidden = search.value.length === 0;
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
    apply();
  });

  search.addEventListener('input', apply);
  sort.addEventListener('change', apply);

  clearSearch?.addEventListener('click', () => {
    search.value = '';
    search.focus();
    apply();
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
    apply();
    search.focus();
  });

  updateStats();
  apply();
})();

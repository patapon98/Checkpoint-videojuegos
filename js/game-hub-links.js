(() => {
  const DATA_URL = '/data/game-hubs/index.json';
  let games = [];
  let scheduled = false;

  function makeNewsLink(game) {
    const link = document.createElement('a');
    link.className = 'news-game-hub-link';
    link.href = game.url;
    link.textContent = 'Consultar ficha';
    link.setAttribute('aria-label', `Consultar la ficha de ${game.title}`);
    return link;
  }

  function makeReleaseLink(game) {
    const link = document.createElement('a');
    link.className = 'release-game-hub-link';
    link.href = game.url;
    link.textContent = 'Ver ficha';
    link.setAttribute('aria-label', `Consultar la ficha de ${game.title}`);
    return link;
  }

  function decorateReleaseCards() {
    const byReleaseId = new Map();
    games.forEach((game) => {
      (game.releaseIds || []).forEach((id) => byReleaseId.set(id, game));
    });

    document.querySelectorAll('[data-release-id]').forEach((card) => {
      const game = byReleaseId.get(card.dataset.releaseId);
      if (!game || card.dataset.gameHubBound === 'true') return;
      card.dataset.gameHubBound = 'true';
      card.dataset.gameHubUrl = game.url;
      card.classList.add('has-game-hub');
      card.title = `Consultar la ficha de ${game.title}`;

      const details = card.querySelector('.platforms')?.parentElement;
      if (details && !details.querySelector('.release-game-hub-link')) {
        details.appendChild(makeReleaseLink(game));
      }
    });
  }

  function newsItem(id) {
    return (window.FINALSECRETO_NEWS || []).find((item) => item.id === id) || null;
  }

  function gameForNews(id) {
    const exact = games.find((game) => (game.newsIds || []).includes(id));
    if (exact) return exact;

    const item = newsItem(id);
    if (!item) return null;
    const haystack = [
      item.id,
      item.title?.es,
      item.summary?.es,
      item.why?.es,
      item.ticker?.keyword?.es,
      item.ticker?.copy?.es
    ].filter(Boolean).join(' ').toLocaleLowerCase('es');

    return games.find((game) =>
      (game.terms || []).some((term) => haystack.includes(String(term).toLocaleLowerCase('es')))
    ) || null;
  }

  function decorateNewsCards() {
    document.querySelectorAll('.news-home-flip[data-news-id], .news-archive-card[id]').forEach((card) => {
      const id = card.dataset.newsId || card.id;
      const game = gameForNews(id);
      if (!game) return;

      card.querySelectorAll('.news-sources').forEach((sources) => {
        if (!sources.querySelector('.news-game-hub-link')) {
          sources.appendChild(makeNewsLink(game));
        }
      });

      const back = card.querySelector('.news-home-flip-back');
      if (back && !back.querySelector('.news-game-hub-link')) {
        const link = makeNewsLink(game);
        link.classList.add('news-game-hub-link-back');
        const flipButton = back.querySelector('[data-home-flip]');
        back.insertBefore(link, flipButton || null);
      }
    });
  }

  function applyLinks() {
    scheduled = false;
    decorateReleaseCards();
    decorateNewsCards();
  }

  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(applyLinks);
  }

  document.addEventListener('click', (event) => {
    const card = event.target.closest('.release[data-game-hub-url]');
    if (!card || event.target.closest('a,button,input,select,textarea,label')) return;
    window.location.assign(card.dataset.gameHubUrl);
  });

  fetch(DATA_URL)
    .then((response) => {
      if (!response.ok) throw new Error('No se pudo cargar el índice de fichas');
      return response.json();
    })
    .then((data) => {
      games = Array.isArray(data.games) ? data.games : [];
      applyLinks();
      const observer = new MutationObserver(scheduleApply);
      observer.observe(document.body, { childList: true, subtree: true });
    })
    .catch(() => {});
})();

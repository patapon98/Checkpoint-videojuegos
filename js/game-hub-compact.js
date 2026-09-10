(() => {
  'use strict';

  const PAGE_SIZE = 5;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let refreshFrame = 0;

  function normalizeLabel(value = '') {
    return value.trim().toLocaleLowerCase('es').replace('fecha de lanzamiento', 'lanzamiento');
  }

  function promoteQuickFacts() {
    const facts = document.getElementById('gameFacts');
    const quickFacts = document.getElementById('quickFacts');
    if (!facts || !quickFacts) return;

    const labels = new Set(
      [...facts.querySelectorAll('.game-fact > span')].map((node) => normalizeLabel(node.textContent))
    );

    quickFacts.querySelectorAll(':scope > div').forEach((row) => {
      const term = row.querySelector('dt')?.textContent?.trim();
      const value = row.querySelector('dd')?.textContent?.trim();
      if (!term || !value || labels.has(normalizeLabel(term))) return;

      const fact = document.createElement('div');
      fact.className = 'game-fact';
      const label = document.createElement('span');
      label.textContent = term;
      const strong = document.createElement('strong');
      strong.textContent = value;
      fact.append(label, strong);
      facts.appendChild(fact);
      labels.add(normalizeLabel(term));
    });
  }

  function organizeOverview() {
    const section = document.getElementById('resumen');
    const premise = document.getElementById('gamePremise');
    const facts = document.getElementById('gameFacts');
    if (!section || !premise || !facts) return;

    const kicker = section.querySelector('.section-heading .game-kicker');
    if (kicker) kicker.textContent = 'En un vistazo';
    if (premise.nextElementSibling !== facts) premise.insertAdjacentElement('afterend', facts);
  }

  function makeCardDetails() {
    document.querySelectorAll('.game-spotlight-card').forEach((card, index) => {
      const description = card.querySelector('p');
      if (!description || card.querySelector('.game-inline-toggle')) return;

      const id = `spotlight-detail-${index + 1}`;
      description.id = id;
      description.hidden = true;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'game-inline-toggle';
      button.setAttribute('aria-controls', id);
      button.setAttribute('aria-expanded', 'false');
      button.textContent = 'Ver detalle';
      button.addEventListener('click', () => {
        const open = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!open));
        button.textContent = open ? 'Ver detalle' : 'Ocultar detalle';
        description.hidden = open;
      });
      card.insertBefore(button, description);
    });

    document.querySelectorAll('.knowledge-card').forEach((card, index) => {
      const highlights = card.querySelector('.knowledge-highlights');
      if (!highlights || card.querySelector('.knowledge-detail-toggle')) return;

      const id = `knowledge-detail-${index + 1}`;
      highlights.id = id;
      highlights.hidden = true;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'knowledge-detail-toggle';
      button.setAttribute('aria-controls', id);
      button.setAttribute('aria-expanded', 'false');
      button.textContent = 'Ver detalles';
      button.addEventListener('click', () => {
        const open = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!open));
        button.textContent = open ? 'Ver detalles' : 'Ocultar detalles';
        highlights.hidden = open;
      });
      highlights.insertAdjacentElement('beforebegin', button);
    });
  }

  function paginateHistory() {
    const list = document.getElementById('gameChangeList');
    if (!list) return;

    const previousControls = list.nextElementSibling?.classList.contains('game-history-pagination')
      ? list.nextElementSibling
      : null;
    previousControls?.remove();

    const items = [...list.querySelectorAll(':scope > .game-change-item')];
    items.forEach((item) => {
      item.hidden = false;
    });

    if (items.length <= PAGE_SIZE) {
      delete list.dataset.paginated;
      return;
    }

    list.dataset.paginated = 'true';
    const totalPages = Math.ceil(items.length / PAGE_SIZE);
    let currentPage = 0;

    const controls = document.createElement('nav');
    controls.className = 'game-history-pagination';
    controls.setAttribute('aria-label', 'Páginas del historial de cambios');

    const previous = document.createElement('button');
    previous.type = 'button';
    previous.className = 'game-history-page-button';
    previous.setAttribute('aria-label', 'Página anterior del historial');
    previous.textContent = '←';

    const status = document.createElement('span');
    status.className = 'game-history-page-status';
    status.setAttribute('aria-live', 'polite');

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'game-history-page-button';
    next.setAttribute('aria-label', 'Página siguiente del historial');
    next.textContent = '→';

    controls.append(previous, status, next);
    list.insertAdjacentElement('afterend', controls);

    const render = (page, moveViewport = false) => {
      currentPage = Math.max(0, Math.min(page, totalPages - 1));
      const first = currentPage * PAGE_SIZE;
      const last = first + PAGE_SIZE;

      items.forEach((item, index) => {
        item.hidden = index < first || index >= last;
      });

      previous.disabled = currentPage === 0;
      next.disabled = currentPage === totalPages - 1;
      status.textContent = `${currentPage + 1} / ${totalPages}`;

      if (moveViewport) {
        const firstVisible = items[first];
        firstVisible?.scrollIntoView({
          behavior: reducedMotion.matches ? 'auto' : 'smooth',
          block: 'start'
        });
      }
    };

    previous.addEventListener('click', () => render(currentPage - 1, true));
    next.addEventListener('click', () => render(currentPage + 1, true));
    render(0);
  }

  function makeSectionCollapsible(sectionId, labels) {
    const section = document.getElementById(sectionId);
    if (!section || section.dataset.disclosureReady === 'true') return;

    const heading = section.querySelector(':scope > .section-heading');
    const content = [...section.children].filter((node) => node !== heading);
    if (!heading || !content.length) return;

    section.dataset.disclosureReady = 'true';
    const body = document.createElement('div');
    body.className = 'game-section-disclosure-body';
    body.id = `${sectionId}-content`;
    body.hidden = true;
    content.forEach((node) => body.appendChild(node));

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'game-section-disclosure-toggle';
    button.setAttribute('aria-controls', body.id);
    button.setAttribute('aria-expanded', 'false');
    button.textContent = labels.closed;

    button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!open));
      button.textContent = open ? labels.closed : labels.open;
      body.hidden = open;
    });

    heading.insertAdjacentElement('afterend', button);
    button.insertAdjacentElement('afterend', body);
  }

  function refreshDynamicEnhancements() {
    promoteQuickFacts();
    organizeOverview();
    makeCardDetails();
    paginateHistory();
  }

  function scheduleDynamicRefresh() {
    if (refreshFrame) return;
    refreshFrame = window.requestAnimationFrame(() => {
      refreshFrame = 0;
      refreshDynamicEnhancements();
    });
  }

  function observeDynamicContent() {
    const observer = new MutationObserver(scheduleDynamicRefresh);
    const targets = [
      document.getElementById('gameFacts'),
      document.getElementById('quickFacts'),
      document.getElementById('confirmado'),
      document.getElementById('gameChangeList')
    ].filter(Boolean);

    targets.forEach((target) => observer.observe(target, { childList: true }));
  }

  function init() {
    refreshDynamicEnhancements();
    makeSectionCollapsible('requisitos-pc', {
      closed: 'Ver requisitos de PC',
      open: 'Ocultar requisitos de PC'
    });
    makeSectionCollapsible('fuentes', {
      closed: 'Consultar fuentes y verificación',
      open: 'Ocultar fuentes y verificación'
    });
    observeDynamicContent();
    document.body.classList.add('game-hub-enhanced');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();

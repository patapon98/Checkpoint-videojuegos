(function homeSlider() {
  const slider = document.querySelector('[data-game-hubs-slider]');
  const viewport = slider?.querySelector('[data-game-hubs-viewport]');
  const track = slider?.querySelector('[data-game-hubs-track]');
  const cards = [...(track?.querySelectorAll('.home-game-hub-card') || [])].slice(0, 9);
  const previous = slider?.querySelector('[data-game-hubs-prev]');
  const next = slider?.querySelector('[data-game-hubs-next]');
  const dots = slider?.querySelector('[data-game-hubs-dots]');
  const hint = slider?.querySelector('[data-game-hubs-swipe-hint]');
  if (!slider || !viewport || !track || !cards.length || !previous || !next || !dots) return;

  const tablet = window.matchMedia('(max-width: 900px)');
  const mobile = window.matchMedia('(max-width: 640px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let perView = mobile.matches ? 1 : tablet.matches ? 2 : 3;
  let pageCount = Math.ceil(cards.length / perView);
  let pointer = null;
  let suppressClickUntil = 0;
  let resizeFrame = 0;

  const offsetForPage = (index) => cards[index * perView]?.offsetLeft || 0;

  const setTrackPosition = (offset, dragOffset = 0) => {
    track.style.transform = `translate3d(${Math.round(-offset + dragOffset)}px,0,0)`;
  };

  const clearDrag = () => {
    pointer = null;
    slider.classList.remove('is-dragging');
    track.classList.remove('is-dragging');
  };

  const show = (index) => {
    current = Math.max(0, Math.min(index, pageCount - 1));
    const firstVisible = current * perView;
    track.classList.remove('peek-nudge');
    clearDrag();
    setTrackPosition(offsetForPage(current));
    cards.forEach((card, cardIndex) => {
      const hidden = cardIndex < firstVisible || cardIndex >= firstVisible + perView;
      card.setAttribute('aria-hidden', String(hidden));
      card.inert = hidden;
    });
    [...dots.querySelectorAll('[data-game-hubs-page]')].forEach((dot, dotIndex) => {
      const active = dotIndex === current;
      dot.classList.toggle('on', active);
      dot.setAttribute('aria-pressed', String(active));
    });
    previous.disabled = current === 0;
    next.disabled = current === pageCount - 1;
  };

  const buildDots = () => {
    dots.innerHTML = Array.from({ length: pageCount }, (_, index) =>
      `<button type="button" data-game-hubs-page="${index}" aria-label="${mobile.matches ? `Mostrar ficha ${index + 1} de ${cards.length}` : `Mostrar grupo ${index + 1} de fichas`}" aria-pressed="${index === current}"></button>`
    ).join('');
  };

  const refreshLayout = () => {
    const firstVisible = current * perView;
    perView = mobile.matches ? 1 : tablet.matches ? 2 : 3;
    pageCount = Math.ceil(cards.length / perView);
    current = Math.min(Math.floor(firstVisible / perView), pageCount - 1);
    buildDots();
    show(current);
  };

  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  dots.addEventListener('click', (event) => {
    const dot = event.target.closest('[data-game-hubs-page]');
    if (dot) show(Number(dot.dataset.gameHubsPage));
  });

  viewport.addEventListener('pointerdown', (event) => {
    if (!event.isPrimary || event.button !== 0 || event.target.closest('button')) return;
    track.classList.remove('peek-nudge');
    hint?.classList.remove('show');
    pointer = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startedAt: performance.now(),
      baseOffset: offsetForPage(current),
      axis: null
    };
  });

  viewport.addEventListener('pointermove', (event) => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const deltaX = event.clientX - pointer.x;
    const deltaY = event.clientY - pointer.y;
    if (!pointer.axis) {
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 7) return;
      if (Math.abs(deltaX) > Math.abs(deltaY) * 1.08) pointer.axis = 'x';
      else if (Math.abs(deltaY) > Math.abs(deltaX)) pointer.axis = 'y';
      else return;
    }
    if (pointer.axis !== 'x') return;
    event.preventDefault();
    slider.classList.add('is-dragging');
    track.classList.add('is-dragging');
    let dragOffset = deltaX;
    if ((current === 0 && deltaX > 0) || (current === pageCount - 1 && deltaX < 0)) dragOffset *= 0.28;
    const limit = viewport.clientWidth * 0.92;
    setTrackPosition(pointer.baseOffset, Math.max(-limit, Math.min(limit, dragOffset)));
  }, { passive: false });

  const finishPointer = (event, cancelled) => {
    if (!pointer || event.pointerId !== pointer.id) return;
    const state = pointer;
    const deltaX = event.clientX - state.x;
    const elapsed = Math.max(1, performance.now() - state.startedAt);
    const horizontal = state.axis === 'x';
    clearDrag();
    if (!horizontal) return;
    suppressClickUntil = performance.now() + 320;
    const advance = !cancelled && (Math.abs(deltaX) >= Math.min(90, viewport.clientWidth * 0.18) || Math.abs(deltaX / elapsed) >= 0.5);
    void track.offsetWidth;
    show(advance ? current + (deltaX < 0 ? 1 : -1) : current);
  };

  viewport.addEventListener('pointerup', (event) => finishPointer(event, false));
  viewport.addEventListener('pointercancel', (event) => finishPointer(event, true));
  viewport.addEventListener('click', (event) => {
    if (performance.now() < suppressClickUntil) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(refreshLayout);
  }, { passive: true });

  slider.classList.add('is-enhanced');
  refreshLayout();

  let seenHint = false;
  try {
    seenHint = sessionStorage.getItem('finalsecreto:seen-game-hubs-hint-v1') === '1';
  } catch (error) {}

  if (mobile.matches && !reducedMotion.matches && !seenHint && cards.length > 1) {
    const startHint = () => {
      track.classList.remove('peek-nudge');
      hint?.classList.remove('show');
      void track.offsetWidth;
      track.classList.add('peek-nudge');
      hint?.classList.add('show');
      track.addEventListener('animationend', (event) => {
        if (event.animationName !== 'game-hubs-peek') return;
        track.classList.remove('peek-nudge');
        try {
          sessionStorage.setItem('finalsecreto:seen-game-hubs-hint-v1', '1');
        } catch (error) {}
      }, { once: true });
      hint?.addEventListener('animationend', () => hint.classList.remove('show'), { once: true });
    };

    if ('IntersectionObserver' in window && hint) {
      const observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.9)) return;
        observer.disconnect();
        requestAnimationFrame(() => requestAnimationFrame(startHint));
      }, { threshold: [0.9], rootMargin: '-10% 0px -10% 0px' });
      observer.observe(hint);
    } else {
      startHint();
    }
  }
})();

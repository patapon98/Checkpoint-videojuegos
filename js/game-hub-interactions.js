(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function activatePreciseNavigation() {
    const nav = document.querySelector('.game-section-nav');
    const shell = nav?.closest('.game-nav-shell');
    if (!nav || !shell) return;

    const selectLink = (hash) => {
      nav.querySelectorAll('a[href^="#"]').forEach((item) => {
        const active = item.getAttribute('href') === hash;
        item.classList.toggle('active', active);
        if (active) item.setAttribute('aria-current', 'location');
        else item.removeAttribute('aria-current');
      });
    };

    const scrollToHash = (hash) => {
      const target = document.querySelector(hash);
      if (!target) return;
      const heading = target.querySelector(':scope > .section-heading') || target;
      const navRect = nav.getBoundingClientRect();
      const shellTop = Number.parseFloat(getComputedStyle(shell).top) || 0;
      const clearance = shellTop + navRect.height + 24;
      const top = window.scrollY + heading.getBoundingClientRect().top - clearance;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: reducedMotion ? 'auto' : 'smooth'
      });
      history.replaceState(null, '', hash);
      selectLink(hash);
    };

    nav.addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      scrollToHash(link.getAttribute('href'));
    }, true);

    document.querySelectorAll('.game-hero-actions a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        scrollToHash(link.getAttribute('href'));
      });
    });
  }

  function patchGalleryTap(viewport) {
    if (viewport.dataset.tapFixBound === 'true') return;
    viewport.dataset.tapFixBound = 'true';

    let press = null;
    let suppressTrustedClickUntil = 0;

    viewport.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      const slide = event.target.closest('[data-gallery-open]');
      if (!slide) return;
      press = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        slide,
        moved: false
      };
    }, true);

    viewport.addEventListener('pointermove', (event) => {
      if (!press || event.pointerId !== press.id) return;
      if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > 8) {
        press.moved = true;
      }
    }, true);

    viewport.addEventListener('pointerup', (event) => {
      if (!press || event.pointerId !== press.id) return;
      const state = press;
      press = null;
      if (state.moved) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      suppressTrustedClickUntil = performance.now() + 400;
      requestAnimationFrame(() => state.slide.click());
    }, true);

    viewport.addEventListener('pointercancel', () => {
      press = null;
    }, true);

    viewport.addEventListener('click', (event) => {
      if (event.isTrusted && performance.now() < suppressTrustedClickUntil) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);
  }

  function watchGallery() {
    const bind = () => {
      const viewport = document.querySelector('.game-gallery-viewport');
      if (viewport) patchGalleryTap(viewport);
      return Boolean(viewport);
    };

    if (bind()) return;
    const observer = new MutationObserver(() => {
      if (bind()) observer.disconnect();
    });
    observer.observe(document.querySelector('#gameGallery') || document.body, {
      childList: true,
      subtree: true
    });
  }

  activatePreciseNavigation();
  watchGallery();
})();

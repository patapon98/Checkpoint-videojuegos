(() => {
  const countdown = document.querySelector('[data-event-countdown]');
  if (countdown) {
    const target = Date.parse(countdown.dataset.eventCountdown || '');
    const status = document.querySelector('[data-event-status]');
    const units = {
      days: countdown.querySelector('[data-event-days]'),
      hours: countdown.querySelector('[data-event-hours]'),
      minutes: countdown.querySelector('[data-event-minutes]'),
      seconds: countdown.querySelector('[data-event-seconds]')
    };

    const updateCountdown = () => {
      const remaining = Math.max(0, target - Date.now());
      const totalSeconds = Math.floor(remaining / 1000);
      units.days.textContent = String(Math.floor(totalSeconds / 86400)).padStart(2, '0');
      units.hours.textContent = String(Math.floor(totalSeconds % 86400 / 3600)).padStart(2, '0');
      units.minutes.textContent = String(Math.floor(totalSeconds % 3600 / 60)).padStart(2, '0');
      units.seconds.textContent = String(totalSeconds % 60).padStart(2, '0');
      if (remaining === 0 && status) status.textContent = 'En directo o finalizado';
    };

    updateCountdown();
    window.setInterval(updateCountdown, 1000);
  }

  const buttons = [...document.querySelectorAll('[data-event-filter]')];
  const cards = [...document.querySelectorAll('[data-event-type]')];
  const total = document.querySelector('[data-event-visible-total]');
  buttons.forEach((button) => button.addEventListener('click', () => {
    const type = button.dataset.eventFilter;
    buttons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('on', active);
      item.setAttribute('aria-pressed', String(active));
    });
    let visible = 0;
    cards.forEach((card) => {
      const show = type === 'all' || card.dataset.eventType === type;
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (total) total.textContent = String(visible);
  }));

  const viewButtons = [...document.querySelectorAll('[data-event-view]')];
  const viewPanels = [...document.querySelectorAll('[data-event-panel]')];
  const search = document.querySelector('[data-event-search]');
  const stageButtons = [...document.querySelectorAll('[data-event-stage-filter]')];
  const allItems = [...document.querySelectorAll('[data-event-all-item]')];
  const allTotal = document.querySelector('[data-event-all-total]');
  const allEmpty = document.querySelector('[data-event-all-empty]');
  let activeStage = 'all';

  const normalize = (value = '') => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  const selectView = (view) => {
    viewButtons.forEach((button) => {
      const active = button.dataset.eventView === view;
      button.classList.toggle('on', active);
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    viewPanels.forEach((panel) => {
      panel.hidden = panel.dataset.eventPanel !== view;
    });
  };

  const filterArchive = () => {
    const query = normalize(search?.value || '');
    let visible = 0;
    allItems.forEach((item) => {
      const matchesStage = activeStage === 'all' || item.dataset.eventStage === activeStage;
      const matchesQuery = !query || normalize(item.textContent).includes(query);
      const show = matchesStage && matchesQuery;
      item.hidden = !show;
      if (show) visible += 1;
    });
    if (allTotal) allTotal.textContent = String(visible);
    if (allEmpty) allEmpty.hidden = visible !== 0;
  };

  viewButtons.forEach((button) => button.addEventListener('click', () => {
    selectView(button.dataset.eventView || 'highlights');
  }));

  stageButtons.forEach((button) => button.addEventListener('click', () => {
    activeStage = button.dataset.eventStageFilter || 'all';
    stageButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('on', active);
      item.setAttribute('aria-pressed', String(active));
    });
    filterArchive();
  }));

  search?.addEventListener('input', () => {
    if (search.value.trim()) selectView('all');
    filterArchive();
  });

  document.querySelectorAll('[data-youtube-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const videoId = button.dataset.youtubeId || '';
      if (!/^[\w-]{11}$/.test(videoId)) return;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
      iframe.title = button.dataset.videoTitle || 'Tráiler oficial';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      button.replaceWith(iframe);
    });
  });
})();

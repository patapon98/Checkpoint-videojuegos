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
})();

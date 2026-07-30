(() => {
  const grid = document.querySelector('#gamesIndexGrid');
  const input = document.querySelector('#gamesSearch');
  if (!grid || !input) return;

  const clear = document.querySelector('#gamesSearchClear');
  const count = document.querySelector('#gamesCount');
  const empty = document.querySelector('#gamesEmpty');
  const cards = [...grid.querySelectorAll('.home-game-hub-card')];
  const total = cards.length;

  // Se comparan las palabras sueltas para que "gears pc" encuentre la ficha
  // aunque en el texto no aparezcan seguidas.
  const normalise = (value) => value
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const haystacks = new Map(cards.map((card) => [card, normalise(card.dataset.search || card.textContent)]));

  const label = (visible) => {
    if (!input.value.trim()) return `${total} ${total === 1 ? 'ficha publicada' : 'fichas publicadas'}`;
    if (!visible) return 'Ninguna coincidencia';
    return `${visible} de ${total} ${total === 1 ? 'ficha' : 'fichas'}`;
  };

  function apply() {
    const terms = normalise(input.value).split(/\s+/).filter(Boolean);
    let visible = 0;

    cards.forEach((card) => {
      const haystack = haystacks.get(card);
      const match = terms.every((term) => haystack.includes(term));
      card.hidden = !match;
      if (match) visible += 1;
    });

    if (empty) empty.hidden = visible !== 0;
    if (count) count.textContent = label(visible);
    if (clear) clear.hidden = !input.value;
  }

  input.addEventListener('input', apply);

  if (clear) {
    clear.addEventListener('click', () => {
      input.value = '';
      apply();
      input.focus();
    });
  }

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && input.value) {
      event.preventDefault();
      input.value = '';
      apply();
    }
  });

  apply();
})();

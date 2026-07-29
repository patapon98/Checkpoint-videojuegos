import { readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

async function replaceRequired(relative, before, after) {
  const file = path.join(root, relative);
  const source = await readFile(file, 'utf8');
  if (!source.includes(before)) throw new Error(`No se encontró el patrón esperado en ${relative}`);
  await writeFile(file, source.replace(before, after), 'utf8');
}

await replaceRequired(
  'js/game-hub.js',
  `  function relatedNews() {\n    const terms = ['god of war laufey', 'laufey', 'faye'];`,
  `  function relatedNews(data = {}) {\n    const terms = (Array.isArray(data.newsTerms) && data.newsTerms.length ? data.newsTerms : [data.title])\n      .filter(Boolean)\n      .map((term) => String(term).toLocaleLowerCase('es'));`
);

await replaceRequired(
  'js/game-hub.js',
  `      const news = relatedNews();\n      document.querySelector('#gameStatus').textContent = data.status;`,
  `      const news = relatedNews(data);\n      document.querySelector('#gameStatus').textContent = data.status;`
);

await replaceRequired(
  'js/game-hub.js',
  `      const news = relatedNews();\n      renderNews(news);\n      renderMedia({ title: 'God of War Laufey', media: [] }, news);\n      startCountdown('2027-02-16');`,
  `      renderNews([]);\n      renderMedia({ title: document.body.dataset.gameTitle || 'el juego', media: [] }, []);\n      startCountdown(document.body.dataset.releaseDate || '2027-02-16');`
);

await replaceRequired(
  'juegos/god-of-war-laufey.html',
  `<link rel="stylesheet" href="/css/game-hub-interactions.css?v=20260730-1">`,
  `<link rel="stylesheet" href="/css/game-hub-interactions.css?v=20260730-2">`
);

await replaceRequired(
  'juegos/god-of-war-laufey.html',
  `<body class="game-hub-page" data-game-id="god-of-war-laufey">`,
  `<body class="game-hub-page" data-game-id="god-of-war-laufey" data-game-title="God of War Laufey" data-release-date="2027-02-16">`
);

await replaceRequired(
  'juegos/god-of-war-laufey.html',
  `<script src="/js/game-hub.js?v=20260730-3"></script>\n<script src="/js/game-hub-interactions.js?v=20260730-1"></script>`,
  `<script src="/js/game-hub.js?v=20260730-4"></script>\n<script src="/js/game-hub-interactions.js?v=20260730-2"></script>`
);

await unlink(path.join(root, 'scripts/finalize-new-game-hubs.mjs'));
await unlink(path.join(root, '.github/workflows/finalize-new-game-hubs.yml'));

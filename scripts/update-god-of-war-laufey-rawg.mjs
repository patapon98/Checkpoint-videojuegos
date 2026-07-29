import { readFile, writeFile } from 'node:fs/promises';

const file = new URL('../data/game-hubs/god-of-war-laufey.json', import.meta.url);
const apiKey = process.env.RAWG_API_KEY;
if (!apiKey) throw new Error('Falta RAWG_API_KEY.');

const data = JSON.parse(await readFile(file, 'utf8'));
const query = new URLSearchParams({ key: apiKey, search: data.title, search_exact: 'true', page_size: '10' });
const searchResponse = await fetch(`https://api.rawg.io/api/games?${query}`);
if (!searchResponse.ok) throw new Error(`RAWG search respondió ${searchResponse.status}.`);
const searchData = await searchResponse.json();
const normalizedTitle = data.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const game = searchData.results.find((item) => item.slug === data.rawg.slug)
  || searchData.results.find((item) => item.name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() === normalizedTitle);
if (!game) throw new Error(`RAWG no devolvió una coincidencia fiable para ${data.title}.`);

const screenshotsResponse = await fetch(`https://api.rawg.io/api/games/${game.id}/screenshots?key=${apiKey}&page_size=12`);
if (!screenshotsResponse.ok) throw new Error(`RAWG screenshots respondió ${screenshotsResponse.status}.`);
const screenshotsData = await screenshotsResponse.json();
const screenshots = screenshotsData.results.map((item) => item.image).filter(Boolean).slice(0, 6);

const next = structuredClone(data);
next.rawg = {
  slug: game.slug,
  id: game.id,
  updatedAt: new Date().toISOString(),
  backgroundImage: game.background_image || data.rawg.backgroundImage || '',
  screenshots
};

const before = JSON.stringify(data.rawg);
const after = JSON.stringify(next.rawg);
if (before === after) {
  console.log('RAWG no contiene cambios para la ficha.');
  process.exit(0);
}

await writeFile(file, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
console.log(`Ficha sincronizada con RAWG (${game.id}, ${screenshots.length} capturas).`);

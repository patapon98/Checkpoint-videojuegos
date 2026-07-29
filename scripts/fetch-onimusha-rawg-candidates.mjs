import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const apiKey = process.env.RAWG_API_KEY;
if (!apiKey) throw new Error('Falta RAWG_API_KEY.');

const root = process.cwd();
const outputDir = path.join(root, 'assets', 'game-hubs', 'onimusha-way-of-the-sword', 'rawg-candidates');
const manifestPath = path.join(root, 'data', 'game-hubs', 'onimusha-rawg-candidates.json');
const slug = 'onimusha-way-of-the-sword';

await mkdir(outputDir, { recursive: true });

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} respondió ${response.status}.`);
  return response.json();
}

const query = new URLSearchParams({
  key: apiKey,
  search: 'Onimusha: Way of the Sword',
  search_exact: 'true',
  page_size: '20'
});
const search = await getJson(`https://api.rawg.io/api/games?${query}`);
const game = search.results.find((item) => item.slug === slug)
  || search.results.find((item) => item.name?.toLowerCase() === 'onimusha: way of the sword');
if (!game) throw new Error('RAWG no devolvió una coincidencia fiable para Onimusha: Way of the Sword.');

const details = await getJson(`https://api.rawg.io/api/games/${game.id}?key=${apiKey}`);
const screenshots = await getJson(`https://api.rawg.io/api/games/${game.id}/screenshots?key=${apiKey}&page_size=20`);

const candidates = [
  { source: 'background_image', url: details.background_image || game.background_image, width: null, height: null },
  { source: 'background_image_additional', url: details.background_image_additional, width: null, height: null },
  ...screenshots.results.map((item, index) => ({
    source: `screenshot_${String(index + 1).padStart(2, '0')}`,
    url: item.image,
    width: item.width || null,
    height: item.height || null
  }))
].filter((item) => item.url);

const unique = candidates.filter((item, index, list) =>
  list.findIndex((candidate) => candidate.url === item.url) === index
).slice(0, 12);

const manifest = {
  rawgGameId: game.id,
  rawgSlug: game.slug,
  rawgUrl: `https://rawg.io/games/${game.slug}`,
  fetchedAt: new Date().toISOString(),
  candidates: []
};

for (let index = 0; index < unique.length; index += 1) {
  const candidate = unique[index];
  const response = await fetch(candidate.url);
  if (!response.ok) throw new Error(`No se pudo descargar ${candidate.url}: ${response.status}.`);
  const type = response.headers.get('content-type') || '';
  const extension = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg';
  const filename = `${String(index + 1).padStart(2, '0')}-${candidate.source}.${extension}`;
  const relativePath = `/assets/game-hubs/onimusha-way-of-the-sword/rawg-candidates/${filename}`;
  await writeFile(path.join(outputDir, filename), Buffer.from(await response.arrayBuffer()));
  manifest.candidates.push({ ...candidate, localPath: relativePath });
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Descargadas ${manifest.candidates.length} imágenes candidatas de RAWG.`);

// Actualización intencionada para disparar el workflow temporal de revisión.

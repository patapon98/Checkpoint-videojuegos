import { writeFile } from 'node:fs/promises';

const pageUrl = 'https://rawg.io/games/onimusha-way-of-the-sword/screenshots';
const response = await fetch(pageUrl, {
  headers: {
    'user-agent': 'Mozilla/5.0 (compatible; FinalSecretoBot/1.0; +https://finalsecreto.com)'
  }
});

if (!response.ok) {
  throw new Error(`RAWG respondió ${response.status} al consultar ${pageUrl}`);
}

const html = await response.text();
const normalized = html
  .replaceAll('\\u002F', '/')
  .replaceAll('\\/', '/')
  .replaceAll('&amp;', '&');

const matches = normalized.match(/https:\/\/media\.rawg\.io\/media\/[^"'<>\\\s]+/g) || [];
const urls = [...new Set(matches.map((url) => url.replace(/[),.;]+$/, '')))]
  .filter((url) => /screenshots|resize\/1280\/.*screenshots/.test(url));

if (urls.length < 4) {
  await writeFile('data/game-hubs/onimusha-rawg-page-debug.html', html, 'utf8');
  throw new Error(`Solo se encontraron ${urls.length} URLs de capturas en la página pública de RAWG.`);
}

const manifest = {
  source: pageUrl,
  capturedAt: new Date().toISOString(),
  urls
};

await writeFile(
  'data/game-hubs/onimusha-rawg-page-images.json',
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8'
);

console.log(`Encontradas ${urls.length} imágenes de RAWG.`);

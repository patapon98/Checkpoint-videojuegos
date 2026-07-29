import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data', 'game-hubs');
const gamesDir = join(root, 'juegos');
const errors = [];

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const text = (value = '') => String(value);
const escapeHtml = (value = '') => text(value).replace(/[&<>]/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
}[character]));
const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(text(value)) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`));
const expect = (condition, message) => {
  if (!condition) errors.push(message);
};
const requireString = (data, key, label) => {
  expect(typeof data[key] === 'string' && data[key].trim().length > 0, `${label}: falta ${key}`);
};
const requireArray = (data, key, label) => {
  expect(Array.isArray(data[key]) && data[key].length > 0, `${label}: ${key} debe contener al menos un elemento`);
};

const indexPath = join(dataDir, 'index.json');
const registry = readJson(indexPath);
expect(Array.isArray(registry.games), 'data/game-hubs/index.json: games debe ser un array');

const jsonFiles = readdirSync(dataDir)
  .filter((name) => name.endsWith('.json') && name !== 'index.json' && !name.startsWith('_'));
const games = new Map();

for (const file of jsonFiles) {
  const path = join(dataDir, file);
  let data;
  try {
    data = readJson(path);
  } catch (error) {
    errors.push(`${file}: JSON inválido (${error.message})`);
    continue;
  }

  const label = `data/game-hubs/${file}`;
  const expectedId = file.replace(/\.json$/, '');
  expect(data.id === expectedId, `${label}: id debe coincidir con el nombre del archivo`);
  expect(!games.has(data.id), `${label}: id duplicado`);
  games.set(data.id, data);

  ['id', 'title', 'subtitle', 'status', 'releaseDate', 'developer', 'publisher', 'genre', 'officialUrl', 'storeUrl', 'heroImage', 'premise', 'context', 'updatedAt'].forEach((key) => requireString(data, key, label));
  ['platforms', 'gallery', 'media', 'confirmed', 'pending', 'sources', 'newsTerms', 'changes', 'relatedGameIds'].forEach((key) => requireArray(data, key, label));

  expect(validDate(data.releaseDate), `${label}: releaseDate debe usar AAAA-MM-DD`);
  expect(validDate(data.updatedAt), `${label}: updatedAt debe usar AAAA-MM-DD`);
  expect(['promotional-key-art', 'official-screenshot'].includes(data.heroImageKind), `${label}: heroImageKind debe ser promotional-key-art u official-screenshot`);
  expect(data.heroImageHasEmbeddedText === false, `${label}: la cabecera debe declarar heroImageHasEmbeddedText: false`);

  const seo = data.seo || {};
  ['title', 'description', 'ogDescription', 'heroTitleHtml', 'heroImageAlt'].forEach((key) => requireString(seo, key, `${label} > seo`));

  const galleryUrls = new Set();
  for (const [position, image] of (data.gallery || []).entries()) {
    expect(image && typeof image.src === 'string' && image.src, `${label}: gallery[${position}] necesita src`);
    expect(image && typeof image.alt === 'string' && image.alt, `${label}: gallery[${position}] necesita alt`);
    expect(!galleryUrls.has(image?.src), `${label}: imagen duplicada en la galería (${image?.src})`);
    galleryUrls.add(image?.src);
  }

  for (const [position, source] of (data.sources || []).entries()) {
    ['label', 'url', 'type'].forEach((key) => requireString(source || {}, key, `${label} > sources[${position}]`));
  }

  const usesRawg = (data.gallery || []).some((image) => image.src.includes('rawg.io'));
  expect(!usesRawg || data.sources.some((source) => /rawg/i.test(source.label)), `${label}: las capturas de RAWG requieren una fuente visible de atribución`);

  for (const [position, change] of (data.changes || []).entries()) {
    ['date', 'title', 'description'].forEach((key) => requireString(change || {}, key, `${label} > changes[${position}]`));
    expect(validDate(change?.date), `${label}: changes[${position}].date debe usar AAAA-MM-DD`);
    expect(!validDate(change?.date) || !validDate(data.updatedAt) || change.date <= data.updatedAt, `${label}: ningún cambio puede ser posterior a updatedAt`);
  }

  expect(!data.relatedGameIds.includes(data.id), `${label}: una ficha no puede enlazarse a sí misma`);
  expect(new Set(data.relatedGameIds).size === data.relatedGameIds.length, `${label}: relatedGameIds contiene duplicados`);
}

const registryIds = new Set();
for (const [position, entry] of (registry.games || []).entries()) {
  const label = `data/game-hubs/index.json > games[${position}]`;
  ['id', 'title', 'url'].forEach((key) => requireString(entry || {}, key, label));
  requireArray(entry || {}, 'releaseIds', label);
  requireArray(entry || {}, 'terms', label);
  expect(!registryIds.has(entry.id), `${label}: id duplicado`);
  registryIds.add(entry.id);
  expect(games.has(entry.id), `${label}: no existe data/game-hubs/${entry.id}.json`);
  expect(entry.url === `/juegos/${entry.id}`, `${label}: url debe ser /juegos/${entry.id}`);
}

for (const id of games.keys()) {
  expect(registryIds.has(id), `${id}: falta su entrada en data/game-hubs/index.json`);
}

for (const [id, data] of games) {
  const label = `juegos/${id}.html`;
  const htmlPath = join(gamesDir, `${id}.html`);
  expect(existsSync(htmlPath), `${label}: no existe la página`);
  if (!existsSync(htmlPath)) continue;

  const html = readFileSync(htmlPath, 'utf8');
  const canonical = `https://finalsecreto.com/juegos/${id}`;
  expect(html.includes(`data-game-id="${id}"`), `${label}: data-game-id no coincide`);
  expect(html.includes(`<link rel="canonical" href="${canonical}">`), `${label}: canonical ausente o incorrecta`);
  expect(html.includes(`<title>${escapeHtml(data.seo.title)}</title>`), `${label}: title no coincide con seo.title`);
  expect(html.includes(`content="${escapeHtml(data.seo.description)}"`), `${label}: description no coincide con seo.description`);
  expect(html.includes(`<h1>${data.seo.heroTitleHtml}</h1>`), `${label}: H1 no coincide con seo.heroTitleHtml`);
  expect(html.includes(`property="article:modified_time" content="${data.updatedAt}"`), `${label}: falta article:modified_time`);

  const staticValues = [
    data.premise,
    data.context,
    ...data.confirmed,
    ...data.pending,
    ...data.sources.map((source) => source.label),
    ...data.changes.flatMap((change) => [change.title, change.description])
  ];
  for (const value of staticValues) {
    expect(html.includes(escapeHtml(value)), `${label}: el HTML inicial no contiene «${value}»`);
  }

  expect(html.includes(`Fecha, plataformas y datos de ${escapeHtml(data.title)}`), `${label}: falta el encabezado SEO del resumen`);
  expect(html.includes(`Qué sabemos de ${escapeHtml(data.title)}`), `${label}: falta el encabezado SEO de confirmados`);
  expect(html.includes(`Últimos cambios en ${escapeHtml(data.title)}`), `${label}: falta el historial de cambios`);
  expect(!/<(?:p|div|ul|dl)[^>]+id="(?:gamePremise|gameFacts|gameContext|confirmedList|pendingList|sourceList|quickFacts)"[^>]*>\s*<\/(?:p|div|ul|dl)>/.test(html), `${label}: hay contenedores SEO críticos vacíos`);

  for (const relatedId of data.relatedGameIds) {
    expect(games.has(relatedId), `${label}: relatedGameIds contiene una ficha inexistente (${relatedId})`);
    expect(html.includes(`href="/juegos/${relatedId}"`), `${label}: falta el enlace visible a ${relatedId}`);
  }

  const schemaMatch = html.match(/<script type="application\/ld\+json" id="gameStructuredData">([\s\S]*?)<\/script>/);
  expect(Boolean(schemaMatch), `${label}: faltan los datos estructurados`);
  if (schemaMatch) {
    try {
      const schema = JSON.parse(schemaMatch[1]);
      const graph = Array.isArray(schema['@graph']) ? schema['@graph'] : [];
      const webPage = graph.find((node) => node['@type'] === 'WebPage');
      const videoGame = graph.find((node) => node['@type'] === 'VideoGame');
      const breadcrumbs = graph.find((node) => node['@type'] === 'BreadcrumbList');
      expect(webPage?.dateModified === data.updatedAt, `${label}: WebPage.dateModified no coincide con updatedAt`);
      expect(webPage?.url === canonical, `${label}: WebPage.url no coincide con la canonical`);
      expect(videoGame?.name === data.title, `${label}: VideoGame.name no coincide con title`);
      expect(videoGame?.description === data.premise, `${label}: VideoGame.description no coincide con premise`);
      expect(videoGame?.dateModified === data.updatedAt, `${label}: VideoGame.dateModified no coincide con updatedAt`);
      expect(Array.isArray(breadcrumbs?.itemListElement) && breadcrumbs.itemListElement.length >= 2, `${label}: BreadcrumbList incompleto`);
    } catch (error) {
      errors.push(`${label}: JSON-LD inválido (${error.message})`);
    }
  }
}

if (errors.length) {
  console.error(`\nValidación de fichas fallida (${errors.length} problema${errors.length === 1 ? '' : 's'}):\n`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Fichas validadas: ${games.size}. JSON, HTML inicial, SEO, cambios y enlazado interno están sincronizados.`);

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data', 'game-hubs');
const gamesDir = join(root, 'juegos');
const sitemapPath = join(root, 'sitemap.xml');
const errors = [];

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const text = (value = '') => String(value);
const escapeHtml = (value = '') => text(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
}[character]));
const escapeText = (value = '') => text(value).replace(/[&<>]/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;'
}[character]));
const escapeRegex = (value = '') => text(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(text(value)) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`));
const formatDate = (value) => new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
}).format(new Date(`${value}T12:00:00`));
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
expect(existsSync(sitemapPath), 'sitemap.xml: no existe');
const sitemap = existsSync(sitemapPath) ? readFileSync(sitemapPath, 'utf8') : '';

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

  ['id', 'title', 'subtitle', 'status', 'releaseDate', 'developer', 'publisher', 'genre', 'officialUrl', 'storeUrl', 'heroImage', 'premise', 'overview', 'context', 'updatedAt'].forEach((key) => requireString(data, key, label));
  ['platforms', 'gallery', 'media', 'sources', 'newsTerms', 'changes', 'relatedGameIds'].forEach((key) => requireArray(data, key, label));
  const hasKnowledgeSections = Array.isArray(data.knowledgeSections) && data.knowledgeSections.length > 0;
  if (hasKnowledgeSections) {
    expect(data.knowledgeSections.length >= 4 && data.knowledgeSections.length <= 6, `${label}: knowledgeSections debe contener entre cuatro y seis bloques`);
    for (const [position, section] of data.knowledgeSections.entries()) {
      ['kicker', 'title', 'summary'].forEach((key) => requireString(section || {}, key, `${label} > knowledgeSections[${position}]`));
      expect(Array.isArray(section?.highlights) && section.highlights.length >= 1 && section.highlights.length <= 3, `${label}: knowledgeSections[${position}].highlights debe contener entre uno y tres elementos`);
      for (const [highlightPosition, highlight] of (section?.highlights || []).entries()) {
        expect(typeof highlight === 'string' && highlight.trim().length > 0, `${label}: knowledgeSections[${position}].highlights[${highlightPosition}] debe ser texto`);
      }
    }
    expect(Array.isArray(data.pendingHighlights), `${label}: pendingHighlights debe ser un array`);
    expect((data.pendingHighlights || []).length <= 3, `${label}: pendingHighlights no puede superar tres elementos`);
    for (const [position, item] of (data.pendingHighlights || []).entries()) {
      expect(typeof item === 'string' && item.trim().length > 0, `${label}: pendingHighlights[${position}] debe ser texto`);
    }
  } else {
    requireArray(data, 'confirmed', label);
    requireArray(data, 'pending', label);
  }
  if (Object.hasOwn(data, 'price')) requireString(data, 'price', label);

  expect(validDate(data.releaseDate), `${label}: releaseDate debe usar AAAA-MM-DD`);
  expect(validDate(data.updatedAt), `${label}: updatedAt debe usar AAAA-MM-DD`);
  expect(['promotional-key-art', 'official-screenshot'].includes(data.heroImageKind), `${label}: heroImageKind debe ser promotional-key-art u official-screenshot`);
  expect(data.heroImageHasEmbeddedText === false, `${label}: la cabecera debe declarar heroImageHasEmbeddedText: false`);

  const seo = data.seo || {};
  ['title', 'description', 'ogDescription', 'heroTitleHtml', 'heroImageAlt'].forEach((key) => requireString(seo, key, `${label} > seo`));

  const spotlight = data.spotlight || {};
  ['kicker', 'title', 'intro'].forEach((key) => requireString(spotlight, key, `${label} > spotlight`));
  expect(Array.isArray(spotlight.items) && spotlight.items.length >= 3, `${label}: spotlight.items debe contener al menos tres elementos`);
  for (const [position, item] of (spotlight.items || []).entries()) {
    ['title', 'value', 'description'].forEach((key) => requireString(item || {}, key, `${label} > spotlight.items[${position}]`));
  }

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

  const usesRawg = (data.gallery || []).some((image) => image.src.includes('rawg.io'))
    || (data.sources || []).some((source) => /rawg/i.test(`${source.label} ${source.url} ${source.type}`));
  expect(!usesRawg, `${label}: usa recursos o texto visible de RAWG; selecciona material oficial de la desarrolladora, editora o tienda`);

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
  const platforms = data.platforms.join(' · ');
  const hasKnowledgeSections = Array.isArray(data.knowledgeSections) && data.knowledgeSections.length > 0;
  expect(html.includes(`data-game-id="${id}"`), `${label}: data-game-id no coincide`);
  expect(html.includes(`data-game-title="${escapeHtml(data.title)}"`), `${label}: data-game-title no coincide`);
  expect(html.includes(`data-release-date="${data.releaseDate}"`), `${label}: data-release-date no coincide`);
  expect(html.includes(`<link rel="canonical" href="${canonical}">`), `${label}: canonical ausente o incorrecta`);
  expect(html.includes(`<title>${escapeHtml(data.seo.title)}</title>`), `${label}: title no coincide con seo.title`);
  expect(html.includes(`content="${escapeHtml(data.seo.description)}"`), `${label}: description no coincide con seo.description`);
  expect(html.includes(`property="article:modified_time" content="${data.updatedAt}"`), `${label}: falta article:modified_time`);
  expect(html.includes(`property="og:image" content="${escapeHtml(data.heroImage)}"`), `${label}: og:image no coincide con heroImage`);
  expect(html.includes(`<h1>${data.seo.heroTitleHtml}</h1>`), `${label}: H1 no coincide con seo.heroTitleHtml`);
  expect(html.includes(`<span class="game-status" id="gameStatus">${escapeHtml(data.status)}</span>`), `${label}: estado visible no coincide`);
  expect(html.includes(`<span>${escapeHtml(platforms)}</span></div>`), `${label}: plataformas del hero no coinciden`);
  expect(html.includes(`<time id="updatedAt" datetime="${data.updatedAt}">${escapeHtml(formatDate(data.updatedAt))}</time>`), `${label}: fecha visible de actualización no coincide`);
  expect(html.includes(`<h2 id="countdownTitle">${escapeHtml(formatDate(data.releaseDate))}</h2>`), `${label}: fecha visible de lanzamiento no coincide`);

  const staticValues = [
    data.premise,
    data.overview,
    data.context,
    data.spotlight.kicker,
    data.spotlight.title,
    data.spotlight.intro,
    ...(data.price ? [data.price] : []),
    ...data.spotlight.items.flatMap((item) => [item.title, item.value, item.description]),
    ...(hasKnowledgeSections
      ? data.knowledgeSections.flatMap((section) => [section.kicker, section.title, section.summary, ...section.highlights])
      : [...data.confirmed, ...data.pending]),
    ...(hasKnowledgeSections ? data.pendingHighlights : []),
    ...data.sources.flatMap((source) => [source.label, source.url, source.type]),
    ...data.changes.flatMap((change) => [change.title, change.description])
  ];
  for (const value of staticValues) {
    expect(html.includes(escapeHtml(value)), `${label}: el HTML inicial no contiene «${value}»`);
  }

  expect(html.includes(`Fecha, plataformas y datos de ${escapeText(data.title)}`), `${label}: falta el encabezado SEO del resumen`);
  const knowledgeHeading = hasKnowledgeSections
    ? `Lo esencial de ${escapeHtml(data.title)}`
    : `Qué sabemos de ${escapeText(data.title)}`;
  expect(html.includes(knowledgeHeading), `${label}: falta el encabezado SEO de información verificada`);
  expect(html.includes(`Últimos cambios en ${escapeText(data.title)}`), `${label}: falta el historial de cambios`);
  expect(!/<(?:p|div|ul|dl)[^>]+id="(?:gamePremise|gameFacts|gameContext|confirmedList|pendingList|knowledgeSections|sourceList|quickFacts)"[^>]*>\s*<\/(?:p|div|ul|dl)>/.test(html), `${label}: hay contenedores SEO críticos vacíos`);

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
      expect(videoGame?.datePublished === data.releaseDate, `${label}: VideoGame.datePublished no coincide con releaseDate`);
      expect(videoGame?.dateModified === data.updatedAt, `${label}: VideoGame.dateModified no coincide con updatedAt`);
      expect(videoGame?.image === data.heroImage, `${label}: VideoGame.image no coincide con heroImage`);
      expect(JSON.stringify(videoGame?.gamePlatform || []) === JSON.stringify(data.platforms), `${label}: VideoGame.gamePlatform no coincide con platforms`);
      const schemaTrailerIds = (videoGame?.trailer || []).map((item) => text(item.embedUrl).split('/').pop()).filter(Boolean);
      const dataTrailerIds = (data.media || []).map((item) => item.videoId).filter(Boolean);
      expect(JSON.stringify(schemaTrailerIds) === JSON.stringify(dataTrailerIds), `${label}: los VideoObject no coinciden con media`);
      expect(Array.isArray(breadcrumbs?.itemListElement) && breadcrumbs.itemListElement.length >= 2, `${label}: BreadcrumbList incompleto`);
    } catch (error) {
      errors.push(`${label}: JSON-LD inválido (${error.message})`);
    }
  }

  const sitemapEntry = new RegExp(`<url>\\s*<loc>${escapeRegex(canonical)}</loc>[\\s\\S]*?<lastmod>${escapeRegex(data.updatedAt)}</lastmod>[\\s\\S]*?</url>`, 'i');
  expect(sitemapEntry.test(sitemap), `sitemap.xml: ${canonical} no tiene lastmod ${data.updatedAt}`);
}

if (errors.length) {
  console.error(`\nValidación de fichas fallida (${errors.length} problema${errors.length === 1 ? '' : 's'}):\n`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Fichas validadas: ${games.size}. JSON, HTML inicial, metadatos, JSON-LD, sitemap, cambios y enlazado interno están sincronizados.`);

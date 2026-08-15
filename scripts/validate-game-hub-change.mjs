import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const automaticPrefix = 'bot/game-hubs-';
const headRef = process.env.HEAD_REF || process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || '';
const automatic = headRef.startsWith(automaticPrefix);
const trustedEditorialHosts = new Set([
  'automaton-media.com',
  'eurogamer.net',
  'famitsu.com',
  'gamesindustry.biz',
  'gamesradar.com',
  'ign.com',
  'techradar.com',
  'theverge.com',
  'videogameschronicle.com'
]);

const fail = (message) => errors.push(message);
const stable = (value) => JSON.stringify(value);
const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))
  && !Number.isNaN(Date.parse(`${value}T12:00:00Z`));
const madridToday = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Madrid',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).format(new Date());

function git(...args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), 'utf8'));
}

function readBaseJson(relativePath) {
  return JSON.parse(git('show', `origin/main:${relativePath}`));
}

function relationHost(urlValue) {
  try {
    return new URL(urlValue).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

function relatedHost(candidate, allowed) {
  return allowed.some((host) => candidate === host
    || candidate.endsWith(`.${host}`)
    || host.endsWith(`.${candidate}`));
}

function trustedEditorialHost(candidate) {
  return [...trustedEditorialHosts].some((host) => candidate === host || candidate.endsWith(`.${host}`));
}

function officialHosts(data) {
  const urls = [
    data.officialUrl,
    data.storeUrl,
    data.trailerUrl,
    data.heroImage,
    ...(data.sources || []).map((item) => item.url),
    ...(data.gallery || []).map((item) => item.src)
  ];
  return [...new Set(urls.map(relationHost).filter(Boolean))];
}

function isHttps(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function addedItems(before = [], after = []) {
  const old = new Set(before.map(stable));
  return after.filter((item) => !old.has(stable(item)));
}

function removedItems(before = [], after = []) {
  const current = new Set(after.map(stable));
  return before.filter((item) => !current.has(stable(item)));
}

function requireAppendOnly(label, before, after) {
  const removed = removedItems(before, after);
  if (removed.length) fail(`${label}: la automatización no puede eliminar ni reescribir elementos previos`);
  return addedItems(before, after);
}

function ensureUnique(values, label) {
  const normalized = values.map((value) => String(value).trim().toLocaleLowerCase('es'));
  if (new Set(normalized).size !== normalized.length) fail(`${label}: contiene duplicados`);
}

if (!automatic) {
  console.log('La rama no pertenece a la automatización de fichas. Se omite la validación editorial incremental.');
  process.exit(0);
}

let changedFiles = [];
try {
  changedFiles = git('diff', '--name-only', 'origin/main...HEAD').split('\n').filter(Boolean);
} catch (error) {
  console.error(`No se pudo comparar la rama con main: ${error.message}`);
  process.exit(1);
}

const jsonPattern = /^data\/game-hubs\/([a-z0-9-]+)\.json$/;
const htmlPattern = /^juegos\/([a-z0-9-]+)\.html$/;
const jsonFiles = changedFiles.filter((file) => jsonPattern.test(file));
const ids = new Set(jsonFiles.map((file) => file.match(jsonPattern)[1]));

if (!jsonFiles.length) fail('La rama automática no modifica ninguna ficha JSON existente.');
if (jsonFiles.length > 3) fail('Una ejecución automática no puede modificar más de tres fichas.');

for (const file of changedFiles) {
  const jsonMatch = file.match(jsonPattern);
  const htmlMatch = file.match(htmlPattern);
  if (jsonMatch) continue;
  if (htmlMatch && ids.has(htmlMatch[1])) continue;
  if (file === 'juegos.html' || file === 'sitemap.xml') continue;
  fail(`Archivo no autorizado en una rama automática: ${file}`);
}

const allowedFields = new Set([
  'status',
  'releaseDate',
  'platforms',
  'storeUrl',
  'trailerUrl',
  'gallery',
  'media',
  'confirmed',
  'pending',
  'sources',
  'changes',
  'updatedAt',
  'price'
]);

for (const relativePath of jsonFiles) {
  const id = relativePath.match(jsonPattern)[1];
  let before;
  let after;

  try {
    before = readBaseJson(relativePath);
    after = readJson(relativePath);
  } catch (error) {
    fail(`${relativePath}: no se pudo leer la ficha existente (${error.message})`);
    continue;
  }

  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changedKeys = [...allKeys].filter((key) => stable(before[key]) !== stable(after[key]));
  const forbidden = changedKeys.filter((key) => !allowedFields.has(key));
  if (forbidden.length) {
    fail(`${relativePath}: campos editoriales o estructurales no autorizados (${forbidden.join(', ')})`);
  }

  if (after.id !== id || before.id !== id) fail(`${relativePath}: el id es inmutable y debe coincidir con el archivo`);
  if (after.updatedAt === before.updatedAt) fail(`${relativePath}: updatedAt debe cambiar`);
  if (!validDate(after.updatedAt)) fail(`${relativePath}: updatedAt debe usar AAAA-MM-DD`);
  if (after.updatedAt !== madridToday) {
    fail(`${relativePath}: updatedAt debe coincidir con la fecha actual en Europe/Madrid (${madridToday})`);
  }
  if (!validDate(after.releaseDate)) fail(`${relativePath}: releaseDate debe usar AAAA-MM-DD`);

  const newChanges = requireAppendOnly(`${relativePath} > changes`, before.changes, after.changes);
  if (newChanges.length !== 1) fail(`${relativePath}: cada actualización debe añadir exactamente una entrada a changes`);
  if (newChanges.length === 1) {
    const change = newChanges[0];
    if (stable(after.changes[0]) !== stable(change)) {
      fail(`${relativePath}: la nueva entrada de changes debe ocupar la primera posición`);
    }
    if (!validDate(change.date) || change.date !== after.updatedAt) {
      fail(`${relativePath}: la fecha del nuevo cambio debe coincidir con updatedAt`);
    }
    if (typeof change.title !== 'string' || !change.title.trim()) fail(`${relativePath}: el cambio necesita title`);
    if (typeof change.description !== 'string' || !change.description.trim()) fail(`${relativePath}: el cambio necesita description`);
    if (!Array.isArray(change.sourceUrls) || change.sourceUrls.length < 1 || change.sourceUrls.length > 4) {
      fail(`${relativePath}: el nuevo cambio debe incluir entre una y cuatro sourceUrls verificadas`);
    }

    const hosts = officialHosts(before);
    const registeredSourceUrls = new Set((after.sources || []).map((item) => item?.url).filter(Boolean));
    for (const sourceUrl of change.sourceUrls || []) {
      const host = relationHost(sourceUrl);
      const youtube = host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtu.be';
      const official = host && relatedHost(host, hosts);
      const trustedEditorial = host && trustedEditorialHost(host);
      const registeredSource = registeredSourceUrls.has(sourceUrl);
      if (!isHttps(sourceUrl)) fail(`${relativePath}: sourceUrls solo admite HTTPS (${sourceUrl})`);
      if (!host || (!youtube && !official && !trustedEditorial && !registeredSource)) {
        fail(`${relativePath}: la fuente debe ser oficial, un medio editorial admitido o estar registrada expresamente en sources (${sourceUrl})`);
      }
      if (/reddit\.com|rawg\.io|x\.com|twitter\.com/i.test(sourceUrl)) {
        fail(`${relativePath}: sourceUrls no puede usar redes sociales, Reddit ni RAWG (${sourceUrl})`);
      }
    }
  }

  const addedGallery = requireAppendOnly(`${relativePath} > gallery`, before.gallery, after.gallery);
  if (addedGallery.length > 3) fail(`${relativePath}: no se pueden añadir más de tres imágenes por ejecución`);
  const knownHosts = officialHosts(before);
  for (const image of addedGallery) {
    const host = relationHost(image?.src);
    if (!image || !isHttps(image.src) || !host) fail(`${relativePath}: cada imagen nueva necesita una URL HTTPS válida`);
    if (typeof image?.alt !== 'string' || image.alt.trim().length < 12) fail(`${relativePath}: cada imagen nueva necesita un alt descriptivo`);
    if (!relatedHost(host, knownHosts)) fail(`${relativePath}: la imagen nueva no usa un alojamiento oficial ya verificado (${image?.src})`);
    if (/rawg\.io|ytimg\.com|youtube\.com|output=preview|\/maxresdefault\./i.test(image?.src || '')) {
      fail(`${relativePath}: la imagen nueva usa una fuente o miniatura prohibida (${image?.src})`);
    }
  }

  const addedMedia = requireAppendOnly(`${relativePath} > media`, before.media, after.media);
  if (addedMedia.length > 3) fail(`${relativePath}: no se pueden añadir más de tres vídeos por ejecución`);
  for (const media of addedMedia) {
    if (media?.type !== 'youtube') fail(`${relativePath}: el multimedia automático solo admite vídeos oficiales de YouTube`);
    if (!/^[A-Za-z0-9_-]{11}$/.test(String(media?.videoId || ''))) fail(`${relativePath}: videoId no es válido`);
    if (typeof media?.title !== 'string' || !media.title.trim()) fail(`${relativePath}: el vídeo necesita title`);
    if (typeof media?.label !== 'string' || !media.label.trim()) fail(`${relativePath}: el vídeo necesita label`);
    if (!validDate(media?.publishedAt) || media.publishedAt > after.updatedAt) fail(`${relativePath}: publishedAt del vídeo no es válido`);
  }

  const addedConfirmed = requireAppendOnly(`${relativePath} > confirmed`, before.confirmed, after.confirmed);
  if (addedConfirmed.length > 5) fail(`${relativePath}: no se pueden añadir más de cinco hechos confirmados por ejecución`);
  const addedSources = requireAppendOnly(`${relativePath} > sources`, before.sources, after.sources);
  if (addedSources.length > 5) fail(`${relativePath}: no se pueden añadir más de cinco fuentes por ejecución`);

  const removedPending = removedItems(before.pending, after.pending);
  const addedPending = addedItems(before.pending, after.pending);
  if (removedPending.length > 5 || addedPending.length > 5) {
    fail(`${relativePath}: pending cambia en exceso para una actualización automática`);
  }

  ensureUnique(after.platforms || [], `${relativePath} > platforms`);
  ensureUnique((after.gallery || []).map((item) => item.src), `${relativePath} > gallery`);
  ensureUnique((after.media || []).map((item) => item.videoId), `${relativePath} > media`);
  ensureUnique((after.sources || []).map((item) => item.url), `${relativePath} > sources`);

  for (const source of after.sources || []) {
    if (!source || !isHttps(source.url)) fail(`${relativePath}: todas las fuentes deben usar HTTPS`);
    if (/reddit\.com|rawg\.io|x\.com|twitter\.com/i.test(source?.url || '')) {
      fail(`${relativePath}: sources no puede usar redes sociales, Reddit ni RAWG (${source?.url})`);
    }
  }

  if (changedKeys.length === 2 && changedKeys.includes('changes') && changedKeys.includes('updatedAt')) {
    fail(`${relativePath}: no se puede registrar una actualización vacía sin modificar información de la ficha`);
  }
}

if (errors.length) {
  console.error(`\nValidación automática de fichas fallida (${errors.length} problema${errors.length === 1 ? '' : 's'}):\n`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Actualización automática validada: ${jsonFiles.length} ficha${jsonFiles.length === 1 ? '' : 's'}, fuentes verificadas y alcance restringido.`);

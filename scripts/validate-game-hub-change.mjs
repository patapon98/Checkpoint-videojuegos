import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];
const headRef = process.env.HEAD_REF || process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || '';
const automatic = headRef.startsWith('bot/game-hubs-');
const prohibitedHosts = new Set(['x.com', 'twitter.com', 'reddit.com', 'rawg.io']);
const stable = (value) => JSON.stringify(value);
const fail = (message) => errors.push(message);
const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`));
const madridToday = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit'
}).format(new Date());

function git(...args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}
function readJson(file) {
  return JSON.parse(readFileSync(path.join(root, file), 'utf8'));
}
function readBaseJson(file) {
  return JSON.parse(git('show', `origin/main:${file}`));
}
function hostOf(value) {
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./, ''); } catch { return ''; }
}
function isHttps(value) {
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}
function prohibited(value) {
  const host = hostOf(value);
  return [...prohibitedHosts].some((item) => host === item || host.endsWith(`.${item}`));
}
function added(before = [], after = []) {
  const previous = new Set(before.map(stable));
  return after.filter((item) => !previous.has(stable(item)));
}
function removed(before = [], after = []) {
  const current = new Set(after.map(stable));
  return before.filter((item) => !current.has(stable(item)));
}

if (!automatic) {
  console.log('La rama no pertenece a la automatización de fichas. Se omite la validación editorial incremental.');
  process.exit(0);
}

const changedFiles = git('diff', '--name-only', 'origin/main...HEAD').split('\n').filter(Boolean);
const jsonPattern = /^data\/game-hubs\/([a-z0-9-]+)\.json$/;
const htmlPattern = /^juegos\/([a-z0-9-]+)\.html$/;
const jsonFiles = changedFiles.filter((file) => jsonPattern.test(file));
const ids = new Set(jsonFiles.map((file) => file.match(jsonPattern)[1]));

if (!jsonFiles.length) fail('La rama automática no modifica ninguna ficha JSON existente.');
if (jsonFiles.length > 3) fail('Una ejecución automática no puede modificar más de tres fichas.');
for (const file of changedFiles) {
  const html = file.match(htmlPattern);
  if (jsonPattern.test(file) || (html && ids.has(html[1])) || file === 'juegos.html' || file === 'sitemap.xml') continue;
  fail(`Archivo no autorizado en una rama automática: ${file}`);
}

// La automatización puede mantener cualquier bloque informativo de una ficha existente.
// Los campos estructurales esenciales (id y archivos) siguen protegidos y los generadores
// posteriores validan requisitos PC, ediciones, HTML, metadatos y SEO.
for (const file of jsonFiles) {
  const id = file.match(jsonPattern)[1];
  let before;
  let after;
  try {
    before = readBaseJson(file);
    after = readJson(file);
  } catch (error) {
    fail(`${file}: no se pudo leer la ficha (${error.message})`);
    continue;
  }

  if (before.id !== id || after.id !== id) fail(`${file}: el id es inmutable y debe coincidir con el archivo`);
  if (!validDate(after.updatedAt) || after.updatedAt !== madridToday) fail(`${file}: updatedAt debe ser la fecha actual en Europe/Madrid (${madridToday})`);
  if (!validDate(after.releaseDate)) fail(`${file}: releaseDate debe usar AAAA-MM-DD`);

  const newChanges = added(before.changes, after.changes);
  const lostChanges = removed(before.changes, after.changes);
  if (lostChanges.length) fail(`${file}: no se puede eliminar historial previo de changes`);
  if (newChanges.length !== 1) fail(`${file}: cada actualización debe añadir exactamente una entrada a changes`);
  if (newChanges.length === 1) {
    const change = newChanges[0];
    if (stable(after.changes?.[0]) !== stable(change)) fail(`${file}: el nuevo change debe ocupar la primera posición`);
    if (change.date !== after.updatedAt) fail(`${file}: change.date debe coincidir con updatedAt`);
    if (!change.title?.trim() || !change.description?.trim()) fail(`${file}: el nuevo change necesita title y description`);
    if (!Array.isArray(change.sourceUrls) || change.sourceUrls.length < 1 || change.sourceUrls.length > 4) fail(`${file}: change.sourceUrls debe contener entre 1 y 4 fuentes`);
    for (const url of change.sourceUrls || []) {
      if (!isHttps(url)) fail(`${file}: todas las sourceUrls deben usar HTTPS (${url})`);
      if (prohibited(url)) fail(`${file}: sourceUrls no admite redes sociales, Reddit ni RAWG (${url})`);
    }
  }

  const newSources = added(before.sources, after.sources);
  for (const source of newSources) {
    if (!source?.url || !isHttps(source.url)) fail(`${file}: las fuentes nuevas deben usar HTTPS`);
    if (source?.url && prohibited(source.url)) fail(`${file}: sources no admite redes sociales, Reddit ni RAWG (${source.url})`);
  }

  const changedKeys = new Set([...Object.keys(before), ...Object.keys(after)].filter((key) => stable(before[key]) !== stable(after[key])));
  if (changedKeys.size === 2 && changedKeys.has('changes') && changedKeys.has('updatedAt')) fail(`${file}: no se puede registrar una actualización vacía`);
}

if (errors.length) {
  console.error(`\nValidación automática de fichas fallida (${errors.length}):\n`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Actualización automática validada: ${jsonFiles.length} ficha${jsonFiles.length === 1 ? '' : 's'}; historial, fuentes y alcance comprobados.`);

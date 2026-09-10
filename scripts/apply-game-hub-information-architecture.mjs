import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const REGISTRY = path.join(ROOT, 'data', 'game-hubs', 'index.json');
const PAGES = path.join(ROOT, 'juegos');
const VERSION = '20260910c';

const stylesheet = `<link rel="stylesheet" href="/css/game-hub-compact.css?v=${VERSION}">`;
const script = `<script src="/js/game-hub-compact.js?v=${VERSION}" defer></script>`;

function addBodyLayoutFlag(html) {
  if (/\bdata-hub-layout="compact"/.test(html)) return html;
  return html.replace(/<body\b([^>]*)>/i, '<body$1 data-hub-layout="compact">');
}

function ensureResource(html, marker, tag, insertionPoint) {
  if (html.includes(marker)) return html;
  return html.replace(insertionPoint, `${tag}\n${insertionPoint}`);
}

function compactNavigation(html) {
  const pattern = /(<nav\b[^>]*\bclass="[^"]*\bgame-section-nav\b[^"]*"[^>]*>)[\s\S]*?(<\/nav>)/i;
  if (!pattern.test(html)) throw new Error('No se encontró la navegación interna de la ficha');

  const links = [
    ['resumen', 'Información'],
    ['multimedia', 'Multimedia'],
    ['noticias', 'Noticias'],
    ['ediciones', 'Ediciones'],
    ['cambios', 'Detalles']
  ].map(([target, label]) => `<a href="#${target}">${label}</a>`).join('');

  return html.replace(pattern, `$1\n      ${links}\n    $2`);
}

function addSectionGroupLabels(html) {
  const groups = {
    resumen: 'information',
    claves: 'information',
    confirmado: 'information',
    multimedia: 'media',
    galeria: 'media',
    noticias: 'tracking',
    ediciones: 'purchase',
    cambios: 'details',
    'requisitos-pc': 'details',
    fuentes: 'details'
  };

  for (const [id, group] of Object.entries(groups)) {
    const pattern = new RegExp(`<section\\b(?=[^>]*\\bid="${id}")[^>]*>`, 'i');
    if (!pattern.test(html)) continue;
    html = html.replace(pattern, (tag) => {
      if (/\bdata-hub-group=/.test(tag)) {
        return tag.replace(/\bdata-hub-group="[^"]*"/, `data-hub-group="${group}"`);
      }
      return tag.replace(/>$/, ` data-hub-group="${group}">`);
    });
  }

  return html;
}

function replaceVersionedResource(html, resource, tag) {
  const pattern = new RegExp(`<${tag}\\b[^>]*${resource.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^>]*>(?:<\\/${tag}>)?`, 'i');
  if (!pattern.test(html)) return html;
  return html.replace(pattern, tag === 'link' ? stylesheet : script);
}

async function updatePage(id) {
  const page = path.join(PAGES, `${id}.html`);
  const original = await readFile(page, 'utf8');
  let html = original;

  html = addBodyLayoutFlag(html);
  html = compactNavigation(html);
  html = addSectionGroupLabels(html);
  html = ensureResource(html, '/css/game-hub-compact.css', stylesheet, '</head>');
  html = ensureResource(html, '/js/game-hub-compact.js', script, '</body>');
  html = replaceVersionedResource(html, '/css/game-hub-compact.css', 'link');
  html = replaceVersionedResource(html, '/js/game-hub-compact.js', 'script');

  if (html !== original) {
    await writeFile(page, html, 'utf8');
    return true;
  }
  return false;
}

const registry = JSON.parse(await readFile(REGISTRY, 'utf8'));
const ids = (registry.games || []).map((game) => game.id).filter(Boolean);
let changed = 0;

for (const id of ids) {
  if (await updatePage(id)) changed += 1;
}

console.log(`Arquitectura compacta aplicada a ${changed} de ${ids.length} fichas.`);

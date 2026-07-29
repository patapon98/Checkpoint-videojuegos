import { readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const version = '20260730-1';
const htmlFiles = [
  'index.html',
  'calendario.html',
  'noticias.html',
  'juegos/god-of-war-laufey.html'
];

for (const relative of htmlFiles) {
  const file = path.join(root, relative);
  const before = await readFile(file, 'utf8');
  const after = before.replace(
    /(src=["'](?:\/)?js\/main\.js\?v=)[^"']+/g,
    `$1${version}`
  );
  if (before === after) throw new Error(`No se encontró main.js en ${relative}.`);
  await writeFile(file, after, 'utf8');
}

const generatorFile = path.join(root, 'scripts/generate-release-calendar.mjs');
const generatorBefore = await readFile(generatorFile, 'utf8');
const generatorAfter = generatorBefore.replace(
  /const MAIN_ASSET_VERSION = "[^"]+";/,
  `const MAIN_ASSET_VERSION = "${version}";`
);
if (generatorBefore === generatorAfter) throw new Error('No se pudo actualizar MAIN_ASSET_VERSION.');
await writeFile(generatorFile, generatorAfter, 'utf8');

await unlink(path.join(root, 'scripts/finalize-laufey-links.mjs'));
await unlink(path.join(root, '.github/workflows/finalize-laufey-links.yml'));

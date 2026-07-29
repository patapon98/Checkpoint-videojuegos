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
  const pattern = /(src=["'](?:\/)?js\/main\.js\?v=)[^"']+/g;
  if (!pattern.test(before)) throw new Error(`No se encontró main.js en ${relative}.`);
  pattern.lastIndex = 0;
  const after = before.replace(pattern, `$1${version}`);
  if (after !== before) await writeFile(file, after, 'utf8');
}

const generatorFile = path.join(root, 'scripts/generate-release-calendar.mjs');
const generatorBefore = await readFile(generatorFile, 'utf8');
const generatorPattern = /const MAIN_ASSET_VERSION = "[^"]+";/;
if (!generatorPattern.test(generatorBefore)) throw new Error('No se encontró MAIN_ASSET_VERSION.');
const generatorAfter = generatorBefore.replace(
  generatorPattern,
  `const MAIN_ASSET_VERSION = "${version}";`
);
if (generatorAfter !== generatorBefore) await writeFile(generatorFile, generatorAfter, 'utf8');

await unlink(path.join(root, 'scripts/finalize-laufey-links.mjs'));
await unlink(path.join(root, '.github/workflows/finalize-laufey-links.yml'));

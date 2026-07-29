import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, "data", "calendar.json");
const SOURCE_FILES = [
  path.join(ROOT, "js", "calendar-trailers.js"),
  path.join(ROOT, "js", "calendar-new-trailers.js")
];

function normalize(value = "") {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function entriesFromSource(source) {
  const entries = [];
  const pattern = /\[\s*(['"])(.*?)\1\s*,\s*(['"])(https:\/\/www\.youtube\.com\/watch\?v=[^'"]+)\3\s*\]/g;
  let match;
  while ((match = pattern.exec(source))) entries.push([match[2], match[4]]);
  return entries;
}

const data = JSON.parse(await readFile(DATA_FILE, "utf8"));
const trailerEntries = [];
for (const file of SOURCE_FILES) trailerEntries.push(...entriesFromSource(await readFile(file, "utf8")));

let imported = 0;
for (const [title, url] of trailerEntries) {
  const target = normalize(title);
  const release = data.releases.find((candidate) => {
    const normalized = normalize(candidate.title);
    return normalized === target || normalized.startsWith(target) || target.startsWith(normalized);
  });
  if (!release || release.trailer === url) continue;
  release.trailer = url;
  imported += 1;
}

await writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`Importados ${imported} tráilers al calendario estructurado.`);

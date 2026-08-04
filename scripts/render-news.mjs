import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";

const DATA_PATH = "data/news-index.json";
const NEWS_PAGES = ["index.html", "noticias.html"];

const versionSources = await Promise.all([
  DATA_PATH,
  "js/news-core.js",
  "js/news.js",
  "js/game-hub.js"
].map((file) => readFile(file, "utf8")));
const version = createHash("sha256").update(versionSources.join("\n")).digest("hex").slice(0, 12);

function updateScriptVersion(html, scriptPath) {
  const escaped = scriptPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(${escaped})(?:\\?v=[^"'\\s>]+)?`, "g");
  if (!pattern.test(html)) throw new Error(`No se encontró ${scriptPath}`);
  return html.replace(pattern, `$1?v=${version}`);
}

for (const page of NEWS_PAGES) {
  const original = await readFile(page, "utf8");
  const output = updateScriptVersion(original, "js/news.js");
  if (output !== original) await writeFile(page, output);
}

const gamePages = (await readdir("juegos"))
  .filter((file) => file.endsWith(".html"))
  .map((file) => `juegos/${file}`);
for (const page of gamePages) {
  const original = await readFile(page, "utf8");
  const output = updateScriptVersion(original, "/js/game-hub.js");
  if (output !== original) await writeFile(page, output);
}

console.log(`Versión de Noticias: ${version}`);

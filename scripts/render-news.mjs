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
const newsStylesheet = await readFile("css/news.css", "utf8");
const newsStylesheetVersion = createHash("sha256").update(newsStylesheet).digest("hex").slice(0, 12);

function updateResourceVersion(html, resourcePath, resourceVersion) {
  const escaped = resourcePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(${escaped})(?:\\?v=[^"'\\s>]+)?`, "g");
  if (!pattern.test(html)) throw new Error(`No se encontró ${resourcePath}`);
  return html.replace(pattern, `$1?v=${resourceVersion}`);
}

for (const page of NEWS_PAGES) {
  const original = await readFile(page, "utf8");
  let output = updateResourceVersion(original, "js/news.js", version);
  output = updateResourceVersion(output, "css/news.css", newsStylesheetVersion);
  if (output !== original) await writeFile(page, output);
}

const gamePages = (await readdir("juegos"))
  .filter((file) => file.endsWith(".html"))
  .map((file) => `juegos/${file}`);
for (const page of gamePages) {
  const original = await readFile(page, "utf8");
  const output = updateResourceVersion(original, "/js/game-hub.js", version);
  if (output !== original) await writeFile(page, output);
}

console.log(`Versión de Noticias: ${version}`);
console.log(`Versión de estilos de Noticias: ${newsStylesheetVersion}`);

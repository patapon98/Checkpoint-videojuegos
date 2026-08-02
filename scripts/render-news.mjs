import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const DATA_PATH = "js/news-data.js";
const PAGES = ["index.html", "noticias.html"];

const data = await readFile(DATA_PATH, "utf8");
const version = createHash("sha256").update(data).digest("hex").slice(0, 12);

function updateScriptVersion(html, scriptPath) {
  const escaped = scriptPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(${escaped})(?:\\?v=[^"'\\s>]+)?`, "g");
  if (!pattern.test(html)) throw new Error(`No se encontró ${scriptPath}`);
  return html.replace(pattern, `$1?v=${version}`);
}

for (const page of PAGES) {
  const original = await readFile(page, "utf8");
  let output = updateScriptVersion(original, "js/news-data.js");
  output = updateScriptVersion(output, "js/news.js");
  if (output !== original) await writeFile(page, output);
}

console.log(`Versión de Noticias: ${version}`);

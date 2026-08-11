import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const NEWS_DIR = "data/news";
const INDEX_PATH = "data/news-index.json";
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function timestamp(item) {
  const value = Date.parse(item.addedAt || item.publishedAt || `${item.date}T00:00:00Z`);
  return Number.isFinite(value) ? value : 0;
}

async function previousOrder() {
  try {
    const current = JSON.parse(await readFile(INDEX_PATH, "utf8"));
    return new Map(current.map((item, index) => [item.id, index]));
  } catch (error) {
    if (error.code === "ENOENT") return new Map();
    throw error;
  }
}

const files = (await readdir(NEWS_DIR, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
  .map((entry) => entry.name)
  .sort();

if (!files.length) throw new Error("data/news no contiene noticias JSON.");

const entries = [];
const ids = new Set();
for (const filename of files) {
  const item = JSON.parse(await readFile(path.join(NEWS_DIR, filename), "utf8"));
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    throw new Error(`${filename}: la raíz debe ser un objeto.`);
  }
  if (!ID_PATTERN.test(item.id || "")) throw new Error(`${filename}: id inválido.`);
  if (filename !== `${item.id}.json`) throw new Error(`${filename}: debe llamarse ${item.id}.json.`);
  if (ids.has(item.id)) throw new Error(`${filename}: id duplicado ${item.id}.`);
  ids.add(item.id);
  entries.push(item);
}

const oldOrder = await previousOrder();
entries.sort((left, right) => {
  const timeDifference = timestamp(right) - timestamp(left);
  if (timeDifference) return timeDifference;
  const leftOrder = oldOrder.get(left.id);
  const rightOrder = oldOrder.get(right.id);
  if (leftOrder !== undefined && rightOrder !== undefined) return leftOrder - rightOrder;
  if (leftOrder === undefined && rightOrder !== undefined) return -1;
  if (leftOrder !== undefined && rightOrder === undefined) return 1;
  return left.id.localeCompare(right.id, "es");
});

const output = `${JSON.stringify(entries, null, 2)}\n`;
let current = "";
try {
  current = await readFile(INDEX_PATH, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
if (output !== current) await writeFile(INDEX_PATH, output, "utf8");
console.log(`Índice de Noticias generado con ${entries.length} entradas.`);

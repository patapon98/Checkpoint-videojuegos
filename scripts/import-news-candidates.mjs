import { access, mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const inboxDir = "data/news-inbox";
const archiveRoot = "data/news-archive";
const newsPath = "js/news-data.js";
const assignmentMarker = "window.FINALSECRETO_NEWS = [\n";
const filenamePattern = /^\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.json$/;
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(message) {
  console.error(message);
  process.exit(1);
}

function loadNews(source) {
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox, { timeout: 1000 });
  if (!Array.isArray(sandbox.window.FINALSECRETO_NEWS)) {
    fail("js/news-data.js no expone window.FINALSECRETO_NEWS como un array.");
  }
  return sandbox.window.FINALSECRETO_NEWS;
}

function candidateTimestamp(item) {
  const value = Date.parse(item.publishedAt || `${item.date}T12:00:00Z`);
  return Number.isFinite(value) ? value : 0;
}

function formatCandidate(item) {
  return `${JSON.stringify(item, null, 2)
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n")},\n`;
}

const entries = (await readdir(inboxDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
  .map((entry) => entry.name)
  .sort();

if (entries.length < 1 || entries.length > 2) {
  fail(`La bandeja debe contener una o dos noticias JSON; contiene ${entries.length}.`);
}

const source = await readFile(newsPath, "utf8");
const current = loadNews(source);
const existingIds = new Set(current.map((item) => item.id));
const candidateIds = new Set();
const candidates = [];

for (const filename of entries) {
  if (!filenamePattern.test(filename)) {
    fail(`${filename}: el nombre debe seguir AAAA-MM-DD-slug.json.`);
  }

  const candidatePath = path.join(inboxDir, filename);
  let item;
  try {
    item = JSON.parse(await readFile(candidatePath, "utf8"));
  } catch (error) {
    fail(`${filename}: JSON inválido (${error.message}).`);
  }

  if (!item || typeof item !== "object" || Array.isArray(item)) {
    fail(`${filename}: la raíz debe ser un objeto de noticia.`);
  }
  if (!idPattern.test(item.id || "")) {
    fail(`${filename}: id ausente o no válido en kebab-case.`);
  }
  if (existingIds.has(item.id)) {
    fail(`${filename}: el id ${item.id} ya existe en js/news-data.js.`);
  }
  if (candidateIds.has(item.id)) {
    fail(`${filename}: el id ${item.id} está repetido en la bandeja.`);
  }
  if (item.featured !== false) {
    fail(`${filename}: featured debe ser false.`);
  }
  if (item.article?.url) {
    fail(`${filename}: una candidata automática no puede incluir article.url.`);
  }

  candidateIds.add(item.id);
  candidates.push({ filename, item });
}

candidates.sort((left, right) => {
  const dateDifference = candidateTimestamp(right.item) - candidateTimestamp(left.item);
  return dateDifference || left.item.id.localeCompare(right.item.id, "es");
});

const markerIndex = source.indexOf(assignmentMarker);
if (markerIndex === -1) {
  fail("No se ha encontrado el punto de inserción de window.FINALSECRETO_NEWS.");
}

const insertionPoint = markerIndex + assignmentMarker.length;
const block = candidates.map(({ item }) => formatCandidate(item)).join("");
const updatedSource = `${source.slice(0, insertionPoint)}${block}${source.slice(insertionPoint)}`;

loadNews(updatedSource);
await writeFile(newsPath, updatedSource, "utf8");

for (const { filename, item } of candidates) {
  const year = item.date.slice(0, 4);
  const month = item.date.slice(5, 7);
  if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month)) {
    fail(`${filename}: date debe usar el formato ISO AAAA-MM-DD.`);
  }

  const archiveDir = path.join(archiveRoot, year, month);
  const archivePath = path.join(archiveDir, filename);
  await mkdir(archiveDir, { recursive: true });
  try {
    await access(archivePath);
    fail(`${filename}: ya existe un archivo con ese nombre en el archivo histórico.`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  await rename(path.join(inboxDir, filename), archivePath);
}

console.log(`Importadas y archivadas: ${candidates.map(({ item }) => item.id).join(", ")}.`);

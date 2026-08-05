import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const allowedCategories = new Set(["Juegos", "Lanzamientos", "Plataformas", "Industria"]);
const errors = [];

function expect(condition, message) {
  if (!condition) errors.push(message);
}

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || "") &&
    !Number.isNaN(Date.parse(`${value}T12:00:00Z`));
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

const sourceFiles = (await readdir("data/news", { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
  .map((entry) => entry.name)
  .sort();
const sourceNews = await Promise.all(sourceFiles.map(async (filename) => ({
  filename,
  item: JSON.parse(await readFile(path.join("data/news", filename), "utf8"))
})));

const gamePages = (await readdir("juegos"))
  .filter((file) => file.endsWith(".html"))
  .map((file) => `juegos/${file}`);
const [dataSource, coreSource, loaderSource, newsGridSource, gameHubSource, indexHtml, newsHtml, ...gameHtml] = await Promise.all([
  readFile("data/news-index.json", "utf8"),
  readFile("js/news-core.js", "utf8"),
  readFile("js/news.js", "utf8"),
  readFile("js/news-grid.js", "utf8"),
  readFile("js/game-hub.js", "utf8"),
  readFile("index.html", "utf8"),
  readFile("noticias.html", "utf8"),
  ...gamePages.map((page) => readFile(page, "utf8"))
]);

const news = JSON.parse(dataSource);
expect(Array.isArray(news), "data/news-index.json debe ser un array");
expect(news.length === sourceNews.length, "El índice no contiene exactamente las noticias de data/news");
const indexedById = new Map((news || []).map((item) => [item.id, item]));
for (const { filename, item } of sourceNews) {
  expect(filename === `${item.id}.json`, `${filename}: el nombre no coincide con el id`);
  expect(indexedById.has(item.id), `${filename}: la noticia falta en el índice`);
  expect(JSON.stringify(stable(indexedById.get(item.id))) === JSON.stringify(stable(item)),
    `${filename}: el índice no coincide con la fuente`);
}

const ids = new Set();
let featuredCount = 0;
let previousTime = Infinity;

for (const [index, item] of (news || []).entries()) {
  const prefix = `Noticia ${index + 1}${item?.id ? ` (${item.id})` : ""}`;
  expect(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item?.id || ""), `${prefix}: id inválido`);
  expect(!ids.has(item?.id), `${prefix}: id duplicado`);
  ids.add(item?.id);

  expect(allowedCategories.has(item?.category?.es), `${prefix}: categoría inválida`);
  expect(isDate(item?.date), `${prefix}: fecha inválida`);
  if (item?.publishedAt) {
    expect(!Number.isNaN(Date.parse(item.publishedAt)), `${prefix}: publishedAt inválido`);
    expect(item.publishedAt.startsWith(item.date), `${prefix}: publishedAt no coincide con date`);
  }
  if (item?.updated) {
    expect(isDate(item.updated), `${prefix}: updated inválido`);
    expect(item.updated >= item.date, `${prefix}: updated no puede ser anterior a date`);
  }

  const time = Date.parse(item?.updated
    ? `${item.updated}T12:00:00Z`
    : item?.publishedAt || `${item?.date}T12:00:00Z`);
  expect(time <= previousTime, `${prefix}: orden cronológico incorrecto`);
  previousTime = time;

  for (const field of ["title", "summary", "why"]) {
    expect(typeof item?.[field]?.es === "string" && item[field].es.trim().length >= 20,
      `${prefix}: falta ${field}.es`);
  }

  const details = item?.homeDetails?.es;
  if (details !== undefined) {
    expect(Array.isArray(details) && details.length === 2,
      `${prefix}: homeDetails.es debe contener dos párrafos cuando existe`);
    for (const paragraph of details || []) {
      expect(typeof paragraph === "string" && paragraph.trim().length >= 90,
        `${prefix}: párrafo de homeDetails demasiado breve`);
      expect(paragraph !== item.summary.es && paragraph !== item.why.es,
        `${prefix}: homeDetails repite el anverso`);
    }
  }

  const emphasis = item?.emphasis?.es;
  expect(Array.isArray(emphasis) && emphasis.length >= 2 && emphasis.length <= 3,
    `${prefix}: emphasis.es debe contener entre dos y tres fragmentos`);

  expect(Array.isArray(item?.sources) && item.sources.length >= 1, `${prefix}: faltan fuentes`);
  const itemSourceUrls = new Set();
  for (const source of item?.sources || []) {
    expect(typeof source.label === "string" && source.label.trim(), `${prefix}: fuente sin etiqueta`);
    expect(typeof source.type?.es === "string" && source.type.es.trim(), `${prefix}: fuente sin tipo`);
    expect(/^https:\/\//.test(source.url || ""), `${prefix}: la fuente no usa HTTPS`);
    expect(!itemSourceUrls.has(source.url), `${prefix}: URL de fuente duplicada`);
    itemSourceUrls.add(source.url);
  }

  if (item?.versionHistory !== undefined) {
    expect(Array.isArray(item.versionHistory) && item.versionHistory.length >= 1,
      `${prefix}: versionHistory debe contener al menos una versión`);
    expect(Boolean(item.updated), `${prefix}: versionHistory requiere updated`);
    const versionDates = new Set();
    for (const [versionIndex, version] of (item.versionHistory || []).entries()) {
      const versionPrefix = `${prefix}, versión ${versionIndex + 1}`;
      expect(isDate(version?.date), `${versionPrefix}: fecha inválida`);
      expect(!versionDates.has(version?.date), `${versionPrefix}: fecha duplicada`);
      versionDates.add(version?.date);
      if (item.updated && version?.date) {
        expect(version.date < item.updated, `${versionPrefix}: debe ser anterior a updated`);
      }
      for (const field of ["title", "summary", "why"]) {
        expect(typeof version?.[field]?.es === "string" && version[field].es.trim().length >= 20,
          `${versionPrefix}: falta ${field}.es`);
      }
      const versionDetails = version?.homeDetails?.es;
      expect(Array.isArray(versionDetails) && versionDetails.length === 2,
        `${versionPrefix}: homeDetails.es debe contener dos párrafos`);
      for (const paragraph of versionDetails || []) {
        expect(typeof paragraph === "string" && paragraph.trim().length >= 90,
          `${versionPrefix}: párrafo de homeDetails demasiado breve`);
      }
      expect(Array.isArray(version?.sources) && version.sources.length >= 1,
        `${versionPrefix}: faltan fuentes`);
      const versionSourceUrls = new Set();
      for (const source of version?.sources || []) {
        expect(typeof source.label === "string" && source.label.trim(), `${versionPrefix}: fuente sin etiqueta`);
        expect(typeof source.type?.es === "string" && source.type.es.trim(), `${versionPrefix}: fuente sin tipo`);
        expect(/^https:\/\//.test(source.url || ""), `${versionPrefix}: la fuente no usa HTTPS`);
        expect(!versionSourceUrls.has(source.url), `${versionPrefix}: URL de fuente duplicada`);
        versionSourceUrls.add(source.url);
      }
    }
  }

  expect(typeof item.featured === "boolean", `${prefix}: featured debe ser booleano`);
  if (item.featured) featuredCount += 1;
  if (item.important !== undefined) expect(typeof item.important === "boolean", `${prefix}: important debe ser booleano`);
  if (item.article?.url) expect(/^\/noticias\/[a-z0-9-]+$/.test(item.article.url), `${prefix}: URL de artículo inválida`);
}

expect(featuredCount <= 1, "Solo puede existir una noticia featured");
expect(!coreSource.includes("FINALSECRETO_NEWS"), "news-core.js todavía depende de la variable global antigua");
expect(coreSource.includes("/data/news-index.json"), "news-core.js no carga el índice JSON");
expect(!loaderSource.includes("FINALSECRETO_NEWS"), "news.js todavía inyecta noticias");
expect(!newsGridSource.includes("FINALSECRETO_NEWS"), "news-grid.js todavía depende de la variable global antigua");
expect(coreSource.includes("data-archive-flip"), "news-core.js no genera el reverso de Noticias");
expect(gameHubSource.includes("/data/news-index.json"), "game-hub.js no carga el índice JSON");
expect(!gameHubSource.includes("FINALSECRETO_NEWS"), "game-hub.js todavía depende de la variable global antigua");

const version = createHash("sha256")
  .update([dataSource, coreSource, loaderSource, gameHubSource].join("\n"))
  .digest("hex").slice(0, 12);
for (const [name, html] of [["index.html", indexHtml], ["noticias.html", newsHtml]]) {
  expect(!html.includes("news-data.js"), `${name}: todavía carga news-data.js`);
  expect(html.includes(`js/news.js?v=${version}`), `${name}: versión de news.js desactualizada`);
}
expect(!newsHtml.includes("news-flip.js"), "noticias.html todavía carga el reverso antiguo");
expect(!newsHtml.includes("news-article-links.js"), "noticias.html todavía carga el inyector antiguo de enlaces");
for (const [index, html] of gameHtml.entries()) {
  expect(!html.includes("news-data.js"), `${gamePages[index]}: todavía carga news-data.js`);
  expect(html.includes(`/js/game-hub.js?v=${version}`), `${gamePages[index]}: versión de game-hub.js desactualizada`);
}

if (errors.length) {
  console.error(`Validación de Noticias fallida (${errors.length} problemas):\n`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Noticias válidas: ${news.length} fuentes individuales y un índice sincronizado.`);

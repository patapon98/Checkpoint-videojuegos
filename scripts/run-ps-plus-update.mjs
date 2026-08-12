import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const file = path.join(process.cwd(), "data", "playstation-plus.json");
const feedUrl = "https://blog.playstation.com/tag/playstation-plus/feed/";
const originalText = await readFile(file, "utf8");
const original = JSON.parse(originalText);
const originalIds = new Set(original.months.map((month) => month.id));
const now = new Date();
const currentId = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
const monthNumbers = new Map([
  ["january", 1], ["february", 2], ["march", 3], ["april", 4],
  ["may", 5], ["june", 6], ["july", 7], ["august", 8],
  ["september", 9], ["october", 10], ["november", 11], ["december", 12]
]);

function targetId(item) {
  const title = item.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
    ?.replaceAll("<![CDATA[", "")
    .replaceAll("]]>", "") || "";
  const monthName = title.match(/for\s+(January|February|March|April|May|June|July|August|September|October|November|December)\b/i)?.[1];
  const publishedText = item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1] || "";
  const published = new Date(publishedText);
  if (!monthName || Number.isNaN(published.getTime())) return null;

  const month = monthNumbers.get(monthName.toLowerCase());
  let year = published.getUTCFullYear();
  if (published.getUTCMonth() + 1 === 12 && month === 1) year += 1;
  return `${year}-${String(month).padStart(2, "0")}`;
}

function decodeEntities(value = "") {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&#8217;", "’")
    .replaceAll("&#039;", "'")
    .replaceAll("&quot;", "\"");
}

async function completeMissingImages(data) {
  const cache = new Map();
  for (const month of data.months) {
    for (const group of month.groups || []) {
      for (const game of group.games || []) {
        if (game.image?.trim()) continue;
        if (!/^https:\/\/blog\.playstation\.com\//i.test(game.source || "")) {
          throw new Error(`${game.title} no tiene imagen y su fuente no permite recuperarla automáticamente`);
        }

        let html = cache.get(game.source);
        if (!html) {
          const response = await nativeFetch(game.source, {
            headers: { "user-agent": "FinalSecreto-PlayStationPlusUpdater/1.0" },
            redirect: "follow"
          });
          if (!response.ok) throw new Error(`${game.source} respondió con HTTP ${response.status}`);
          html = await response.text();
          cache.set(game.source, html);
        }

        const decoded = decodeEntities(html);
        const titleIndex = decoded.toLowerCase().indexOf(game.title.toLowerCase());
        if (titleIndex < 0) throw new Error(`No se encontró ${game.title} en su fuente oficial para recuperar la imagen`);

        const images = [...decoded.matchAll(/https:\/\/blog\.playstation\.com\/uploads\/[^"'<>\s]+/gi)]
          .map((match) => ({ url: match[0], index: match.index ?? 0 }))
          .filter((item, index, list) => list.findIndex((candidate) => candidate.url === item.url) === index);
        const nearest = images.sort((a, b) => Math.abs(a.index - titleIndex) - Math.abs(b.index - titleIndex))[0];
        if (!nearest) throw new Error(`No se encontró una imagen oficial para ${game.title}`);
        game.image = nearest.url.replaceAll("&amp;", "&");
      }
    }
  }
}

const nativeFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const response = await nativeFetch(input, init);
  if (String(input) !== feedUrl) return response;

  const xml = await response.text();
  const filteredItems = [...xml.matchAll(/<item>[\s\S]*?<\/item>/gi)]
    .map(([item]) => item)
    .filter((item) => {
      const id = targetId(item);
      return id && (originalIds.has(id) || id >= currentId);
    });
  const filteredXml = xml.replace(/<item>[\s\S]*?<\/item>/gi, "").replace("</channel>", `${filteredItems.join("\n")}\n</channel>`);
  return new Response(filteredXml, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
};

const nativeExit = process.exit;
const noopSignal = Symbol("ps-plus-noop");
process.exit = (code = 0) => {
  if (code === 0) throw noopSignal;
  return nativeExit(code);
};

try {
  await import("./update-ps-plus.mjs");
} catch (error) {
  if (error !== noopSignal) throw error;
} finally {
  process.exit = nativeExit;
  globalThis.fetch = nativeFetch;
}

const updated = JSON.parse(await readFile(file, "utf8"));
updated.months = updated.months.filter((month) => originalIds.has(month.id) || month.id >= currentId);
await completeMissingImages(updated);

for (const month of updated.months) {
  for (const group of month.groups || []) {
    for (const game of group.games || []) {
      if (!game.image?.trim()) throw new Error(`${game.title} sigue sin una imagen válida`);
    }
  }
}

const comparable = (data) => JSON.stringify({ ...data, updatedAt: "" });
if (comparable(updated) === comparable(original)) {
  await writeFile(file, originalText, "utf8");
  console.log("No hay novedades oficiales vigentes.");
} else {
  updated.updatedAt = now.toISOString().slice(0, 10);
  await writeFile(file, JSON.stringify(updated, null, 2) + "\n", "utf8");
}

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DATA_FILE = path.join(ROOT, "data", "playstation-plus.json");
const FEED_URL = "https://blog.playstation.com/tag/playstation-plus/feed/";
const MONTHS = new Map([
  ["january", { number: 1, es: "enero" }],
  ["february", { number: 2, es: "febrero" }],
  ["march", { number: 3, es: "marzo" }],
  ["april", { number: 4, es: "abril" }],
  ["may", { number: 5, es: "mayo" }],
  ["june", { number: 6, es: "junio" }],
  ["july", { number: 7, es: "julio" }],
  ["august", { number: 8, es: "agosto" }],
  ["september", { number: 9, es: "septiembre" }],
  ["october", { number: 10, es: "octubre" }],
  ["november", { number: 11, es: "noviembre" }],
  ["december", { number: 12, es: "diciembre" }]
]);

function decodeEntities(value = "") {
  return value
    .replaceAll("<![CDATA[", "")
    .replaceAll("]]>", "")
    .replace(/&#(x?[0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(code.toLowerCase().startsWith("x")
        ? Number.parseInt(code.slice(1), 16)
        : Number.parseInt(code, 10)))
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#039;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function stripHtml(value = "") {
  return decodeEntities(value)
    .replace(/<del\b[^>]*>[\s\S]*?<\/del>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tagValue(block, tag) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? stripHtml(match[1]) : "";
}

function parseFeed(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(([, block]) => ({
    title: tagValue(block, "title"),
    link: tagValue(block, "link"),
    publishedAt: tagValue(block, "pubDate")
  }));
}

function targetMonth(post) {
  const match = post.title.match(/for\s+(January|February|March|April|May|June|July|August|September|October|November|December)\b/i);
  if (!match) return null;

  const month = MONTHS.get(match[1].toLowerCase());
  const published = new Date(post.publishedAt);
  if (Number.isNaN(published.getTime())) return null;

  let year = published.getUTCFullYear();
  const publishedMonth = published.getUTCMonth() + 1;
  if (publishedMonth === 12 && month.number === 1) year += 1;

  return {
    id: `${year}-${String(month.number).padStart(2, "0")}`,
    label: `${month.es[0].toUpperCase()}${month.es.slice(1)} ${year}`,
    month: month.es,
    number: month.number,
    year
  };
}

function findArticleBody(html) {
  const candidates = [
    /<div[^>]+class=["'][^"']*article-content[^"']*["'][^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]+class=["'][^"']*entry-content[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*<\/div>/i,
    /<main\b[^>]*>([\s\S]*?)<\/main>/i
  ];
  for (const pattern of candidates) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  return html;
}

function imageBefore(body, position) {
  const start = Math.max(0, position - 5000);
  const chunk = body.slice(start, position);
  const links = [...chunk.matchAll(/href=["'](https:\/\/blog\.playstation\.com\/uploads\/[^"']+)["']/gi)];
  return links.at(-1)?.[1]?.replaceAll("&amp;", "&") || "";
}

function parseGames(html, kind, source) {
  const body = findArticleBody(html);
  const premiumHeading = body.search(/PlayStation Plus Premium(?:\s*<|\s*$)/i);
  const headings = [...body.matchAll(/<(h2|h3|p)\b[^>]*>([\s\S]*?)<\/\1>/gi)];
  const games = [];

  for (const heading of headings) {
    const text = stripHtml(heading[2]);
    const match = text.match(/^(.+?)\s*\|\s*((?:PS5|PS4)(?:\s*,\s*(?:PS5|PS4))*)$/i);
    if (!match) continue;

    const title = match[1].replace(/\s+/g, " ").trim();
    if (/PlayStation Plus/i.test(title)) continue;

    games.push({
      title,
      platforms: match[2].split(",").map((platform) => platform.trim().toUpperCase()),
      image: imageBefore(body, heading.index),
      source,
      tier: kind === "monthly"
        ? "essential"
        : premiumHeading >= 0 && heading.index > premiumHeading
          ? "premium"
          : "extra"
    });
  }

  return games.filter((game, index, list) =>
    game.image && list.findIndex((candidate) => candidate.title === game.title && candidate.tier === game.tier) === index
  );
}

function articleAvailability(html, month, kind) {
  const text = stripHtml(findArticleBody(html));

  if (kind === "monthly") {
    const range = text.match(/from\s+(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)?\s*([A-Za-z]+)\s+(\d{1,2})\s+until\s+(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)?\s*([A-Za-z]+)\s+(\d{1,2})/i);
    if (range) {
      const startMonth = MONTHS.get(range[1].toLowerCase())?.es || month.month;
      const endMonth = MONTHS.get(range[3].toLowerCase())?.es || startMonth;
      return startMonth === endMonth
        ? `${range[2]}–${range[4]} de ${endMonth}`
        : `${range[2]} de ${startMonth}–${range[4]} de ${endMonth}`;
    }
  }

  const otherRegions = text.match(/full lineup will be available(?: to play)? on\s+([A-Za-z]+)\s+(\d{1,2})\s+in all other regions/i);
  if (otherRegions) {
    const monthName = MONTHS.get(otherRegions[1].toLowerCase())?.es || month.month;
    return `Desde el ${otherRegions[2]} de ${monthName}`;
  }

  const globalDate = text.match(/available globally\s+([A-Za-z]+)\s+(\d{1,2})/i);
  if (globalDate) {
    const monthName = MONTHS.get(globalDate[1].toLowerCase())?.es || month.month;
    return `Desde el ${globalDate[2]} de ${monthName}`;
  }

  return `Añadidos en ${month.month}`;
}

function sameTitle(left, right) {
  const normalize = (value) => value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLowerCase();
  return normalize(left) === normalize(right);
}

function mergeGames(current = [], incoming, availability) {
  return incoming.map((game) => {
    const existing = current.find((candidate) => sameTitle(candidate.title, game.title));
    return {
      title: game.title,
      platforms: game.platforms,
      available: existing?.available || availability,
      image: game.image,
      ...(existing?.summary ? { summary: existing.summary } : {}),
      source: game.source
    };
  });
}

function defaultGroup(id) {
  if (id === "essential") {
    return { id, label: "Essential", access: "Disponible también para Extra y Premium" };
  }
  if (id === "extra") {
    return { id, label: "Extra", access: "También disponible para Premium" };
  }
  return { id, label: "Premium", access: "Clásicos y ventajas adicionales" };
}

function pendingText(id, month) {
  if (id === "extra") return `Sony todavía no ha anunciado el catálogo de ${month}. Esta sección se completará cuando se publique la información oficial.`;
  if (id === "premium") return `Los clásicos y añadidos de Premium para ${month} todavía no se han anunciado oficialmente.`;
  return `Los juegos mensuales de Essential para ${month} todavía no se han anunciado oficialmente.`;
}

function upsertMonth(data, post, html, kind) {
  const month = targetMonth(post);
  if (!month) return false;

  const parsed = parseGames(html, kind, post.link);
  if (!parsed.length) {
    throw new Error(`No se pudieron extraer juegos de ${post.link}`);
  }

  let record = data.months.find((item) => item.id === month.id);
  if (!record) {
    record = {
      id: month.id,
      label: month.label,
      availability: `Información oficial de ${month.month}`,
      headline: `PlayStation Plus en ${month.month} de ${month.year}`,
      source: post.link,
      groups: ["essential", "extra", "premium"].map((id) => ({
        ...defaultGroup(id),
        pending: pendingText(id, month.month)
      }))
    };
    data.months.push(record);
  }

  const availability = articleAvailability(html, month, kind);
  record.label = month.label;
  record.headline = `PlayStation Plus en ${month.month} de ${month.year}`;
  record.source = post.link;

  const targetTiers = kind === "monthly" ? ["essential"] : ["extra", "premium"];
  for (const tier of targetTiers) {
    const incoming = parsed.filter((game) => game.tier === tier);
    if (!incoming.length) continue;

    let group = record.groups.find((item) => item.id === tier);
    if (!group) {
      group = defaultGroup(tier);
      record.groups.push(group);
    }

    group.label = defaultGroup(tier).label;
    group.access = defaultGroup(tier).access;
    group.games = mergeGames(group.games, incoming, availability);
    delete group.pending;
  }

  if (kind === "monthly") {
    record.availability = availability;
  } else if (!record.availability || record.availability.startsWith("Información oficial")) {
    record.availability = availability;
  }

  record.groups.sort((a, b) => ["essential", "extra", "premium"].indexOf(a.id) - ["essential", "extra", "premium"].indexOf(b.id));
  return true;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "FinalSecreto-PlayStationPlusUpdater/1.0" },
    redirect: "follow"
  });
  if (!response.ok) throw new Error(`${url} respondió con HTTP ${response.status}`);
  return response.text();
}

const original = await readFile(DATA_FILE, "utf8");
const data = JSON.parse(original);
const feed = await fetchText(FEED_URL);
const posts = parseFeed(feed)
  .filter((post) => /^PlayStation Plus (?:Monthly Games|Game Catalog) for\s+/i.test(post.title))
  .slice(0, 8);

if (!posts.length) throw new Error("El feed oficial no devolvió publicaciones mensuales de PlayStation Plus.");

let inspected = 0;
for (const post of posts) {
  const month = targetMonth(post);
  if (!month) continue;

  const existing = data.months.find((item) => item.id === month.id);
  const kind = /^PlayStation Plus Monthly Games/i.test(post.title) ? "monthly" : "catalog";
  const relevantGroupIds = kind === "monthly" ? ["essential"] : ["extra", "premium"];
  const alreadyStored = existing
    && relevantGroupIds.every((id) => existing.groups.some((group) => group.id === id && (group.games?.length || group.pending)))
    && existing.groups.some((group) => relevantGroupIds.includes(group.id) && group.games?.some((game) => game.source === post.link));

  if (alreadyStored) continue;

  const html = await fetchText(post.link);
  upsertMonth(data, post, html, kind);
  inspected += 1;
}

data.months.sort((a, b) => b.id.localeCompare(a.id));
const nextWithoutDate = JSON.stringify({ ...data, updatedAt: data.updatedAt }, null, 2) + "\n";
const originalWithoutDate = JSON.stringify(JSON.parse(original), null, 2) + "\n";

if (nextWithoutDate === originalWithoutDate || inspected === 0) {
  console.log("PlayStation Plus ya estaba actualizado.");
  process.exit(0);
}

data.updatedAt = new Date().toISOString().slice(0, 10);
await writeFile(DATA_FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`PlayStation Plus actualizado con ${inspected} publicación${inspected === 1 ? "" : "es"} oficial${inspected === 1 ? "" : "es"}.`);

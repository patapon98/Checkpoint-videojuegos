import crypto from "node:crypto";

const MONTH_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const DEFAULT_PLATFORM_ORDER = ["ps5", "ps4", "xbox", "pc", "switch"];

function visiblePlatformKey(value = "") {
  const text = String(value).replace(/<[^>]*>/g, " ").trim().toLowerCase();
  if (/^ps5\b/.test(text)) return "ps5";
  if (/^ps4\b/.test(text)) return "ps4";
  if (/^xbox\b/.test(text)) return "xbox";
  if (/^pc\b/.test(text)) return "pc";
  if (/^switch\b/.test(text)) return "switch";
  return "";
}

export function sortPlatformKeys(platforms = [], order = DEFAULT_PLATFORM_ORDER) {
  const ranks = new Map(order.map((platform, index) => [platform, index]));
  return [...platforms].sort((a, b) => (ranks.get(a) ?? Number.MAX_SAFE_INTEGER) - (ranks.get(b) ?? Number.MAX_SAFE_INTEGER));
}

export function sortPlatformsHtml(platformsHtml = "", order = DEFAULT_PLATFORM_ORDER) {
  const ranks = new Map(order.map((platform, index) => [platform, index]));
  return String(platformsHtml)
    .split(/\s*·\s*/)
    .map((platform) => platform.trim())
    .filter(Boolean)
    .sort((a, b) => (ranks.get(visiblePlatformKey(a)) ?? Number.MAX_SAFE_INTEGER) - (ranks.get(visiblePlatformKey(b)) ?? Number.MAX_SAFE_INTEGER))
    .join(" · ");
}

export function decodeHtml(value = "") {
  return String(value)
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function stripHtml(value = "") {
  return decodeHtml(String(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

export function attributes(tag = "") {
  return Object.fromEntries(
    [...String(tag).matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)]
      .map(([, name, , value]) => [name.toLowerCase(), decodeHtml(value.trim())])
  );
}

export function slugify(value = "") {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function shortHash(value = "") {
  return crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, 12);
}

function balancedDivAt(html, start) {
  const open = html.slice(start).match(/^<div\b[^>]*>/i);
  if (!open) throw new Error(`No hay un <div> válido en la posición ${start}.`);
  const openEnd = start + open[0].length;
  const tagPattern = /<\/?div\b[^>]*>/gi;
  tagPattern.lastIndex = openEnd;
  let depth = 1;
  let match;
  while ((match = tagPattern.exec(html))) {
    if (/^<\/div/i.test(match[0])) depth -= 1;
    else depth += 1;
    if (depth === 0) {
      return {
        start,
        openEnd,
        closeStart: match.index,
        end: tagPattern.lastIndex,
        openTag: open[0],
        inner: html.slice(openEnd, match.index),
        outer: html.slice(start, tagPattern.lastIndex)
      };
    }
  }
  throw new Error(`El <div> iniciado en ${start} no se cierra.`);
}

export function elementById(html, id) {
  const pattern = new RegExp(`<div\\b[^>]*\\bid=["']${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`, "i");
  const match = pattern.exec(html);
  if (!match) throw new Error(`No se encontró #${id}.`);
  return balancedDivAt(html, match.index);
}

export function replaceElementInner(html, id, inner) {
  const element = elementById(html, id);
  return html.slice(0, element.openEnd) + inner + html.slice(element.closeStart);
}

export function topLevelDivs(inner) {
  const result = [];
  let cursor = 0;
  while (cursor < inner.length) {
    const next = inner.slice(cursor).search(/<div\b/i);
    if (next < 0) break;
    const start = cursor + next;
    const element = balancedDivAt(inner, start);
    result.push(element);
    cursor = element.end;
  }
  return result;
}

export function tagInner(html, tag, className = null) {
  const classPart = className ? `(?=[^>]*\\bclass=["'][^"']*\\b${className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b[^"']*["'])` : "";
  const pattern = new RegExp(`<${tag}\\b${classPart}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  return pattern.exec(html)?.[1] ?? "";
}

export function firstTag(html, tag, className = null) {
  const classPart = className ? `(?=[^>]*\\bclass=["'][^"']*\\b${className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b[^"']*["'])` : "";
  const pattern = new RegExp(`<${tag}\\b${classPart}[^>]*>`, "i");
  return pattern.exec(html)?.[0] ?? "";
}

export function monthKey(date) {
  return String(date).slice(0, 7);
}

export function monthLabel(key) {
  const [year, month] = key.split("-").map(Number);
  if (!year || !month) return key;
  const name = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric", timeZone: "Europe/Madrid" })
    .format(new Date(Date.UTC(year, month - 1, 2)));
  return name[0].toLocaleUpperCase("es-ES") + name.slice(1);
}

export function shortMonth(date) {
  const month = Number(String(date).slice(5, 7));
  return MONTH_SHORT[month - 1] || "";
}

export function spanishLongDate(date) {
  const parsed = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" }).format(parsed);
}

export function todayMadrid() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function addMonths(key, offset) {
  const [year, month] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function normalizeTitleHtml(html = "") {
  return String(html)
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .trim();
}

export function releaseTitleFromHeading(headingHtml = "") {
  const withoutActions = String(headingHtml)
    .replace(/<a\b[^>]*class=["'][^"']*\bstore-cta\b[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, "")
    .replace(/<a\b[^>]*class=["'][^"']*\btag-review\b[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, "")
    .replace(/<span\b[^>]*class=["'][^"']*\btag-dlc\b[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, "");
  return stripHtml(withoutActions);
}

export function sourceHost(url = "") {
  try { return new URL(url).hostname.toLowerCase(); }
  catch { return ""; }
}

export function isThirdPartyImage(url = "") {
  const host = sourceHost(url);
  return host === "media.rawg.io" || host.endsWith("rawg.io") || host === "i.ytimg.com";
}

export function releaseStateHash(data, today = todayMadrid()) {
  const currentMonth = monthKey(today);
  const archiveStart = addMonths(currentMonth, -(data.settings?.archiveMonths ?? 1));
  const visible = data.releases
    .filter((release) => monthKey(release.date) >= archiveStart)
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title, "es"));
  const countdown = resolveCountdown(data, today);
  const home = selectHomeReleases(data, today).map((release) => release.id);
  return shortHash(JSON.stringify({
    today,
    status: visible.map((release) => [release.id, release.date <= today ? "out" : "upcoming"]),
    months: [...new Set(visible.map((release) => monthKey(release.date)))],
    countdown: countdown?.id || null,
    home
  }));
}

export function releasePriority(release) {
  if (Number.isFinite(release.priority)) return release.priority;
  const badgeClass = release.badge?.class || "";
  if (badgeClass.includes("hype-max")) return 100;
  if (badgeClass.includes("hype-high")) return 70;
  if (release.tag) return 55;
  if (badgeClass.includes("hype-mid")) return 40;
  return 20;
}

export function resolveCountdown(data, today = todayMadrid()) {
  const preferred = data.releases.find((release) => release.id === data.settings?.countdownId && release.date >= today);
  if (preferred) return preferred;
  return data.releases
    .filter((release) => release.date >= today)
    .sort((a, b) => releasePriority(b) - releasePriority(a) || a.date.localeCompare(b.date))[0] || null;
}

export function selectHomeReleases(data, today = todayMadrid()) {
  const limit = Math.max(1, data.settings?.homeLimit ?? 5);
  const countdown = resolveCountdown(data, today);
  const upcoming = data.releases.filter((release) => release.date >= today && release.id !== countdown?.id);
  const byId = new Map(upcoming.map((release) => [release.id, release]));
  const chosen = [];

  for (const id of data.settings?.homePinnedIds || []) {
    const release = byId.get(id);
    if (!release || chosen.includes(release)) continue;
    chosen.push(release);
    if (chosen.length >= limit - (countdown ? 1 : 0)) break;
  }

  const remaining = upcoming
    .filter((release) => !chosen.includes(release))
    .sort((a, b) => {
      const nearA = Math.max(0, Math.floor((new Date(`${a.date}T00:00:00Z`) - new Date(`${today}T00:00:00Z`)) / 864e5));
      const nearB = Math.max(0, Math.floor((new Date(`${b.date}T00:00:00Z`) - new Date(`${today}T00:00:00Z`)) / 864e5));
      const scoreA = releasePriority(a) * 10 - Math.min(nearA, 365);
      const scoreB = releasePriority(b) * 10 - Math.min(nearB, 365);
      return scoreB - scoreA || a.date.localeCompare(b.date);
    });

  while (chosen.length < limit - (countdown ? 1 : 0) && remaining.length) chosen.push(remaining.shift());
  chosen.sort((a, b) => a.date.localeCompare(b.date) || releasePriority(b) - releasePriority(a));
  if (countdown && chosen.length < limit) chosen.push(countdown);
  return chosen.slice(0, limit);
}

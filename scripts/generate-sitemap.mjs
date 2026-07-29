import { execFileSync } from "node:child_process";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SITE_ORIGIN = "https://finalsecreto.com";
const OUTPUT = path.join(ROOT, "sitemap.xml");
const PUBLIC_PAGE = /^(?:index|noticias|resenas|calendario|playstation-plus|sobre-mi|contacto)\.html$|^(?:noticias|resenas|playstation-plus|juegos)\/[^/]+\.html$/;
const DATE_OVERRIDE = process.env.SITEMAP_DATE;
const PSPLUS_DATE_OVERRIDE = process.env.SITEMAP_PSPLUS_DATE;

async function walk(directory = ROOT) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if ([".git", ".github", "node_modules", "scripts"].includes(entry.name)) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolutePath));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(path.relative(ROOT, absolutePath).split(path.sep).join("/"));
  }
  return files;
}

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)].map(([, name, , value]) => [name.toLowerCase(), value.trim()]));
}

function canonicalFrom(html, file) {
  const canonicalTag = [...html.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => attributes(tag)).find((attrs) => attrs.rel?.toLowerCase().split(/\s+/).includes("canonical"));
  if (!canonicalTag?.href) throw new Error(`${file} no declara una URL canónica.`);
  const canonical = new URL(canonicalTag.href);
  if (canonical.origin !== SITE_ORIGIN) throw new Error(`${file} usa una URL canónica ajena a ${SITE_ORIGIN}.`);
  canonical.hash = "";
  canonical.search = "";
  return canonical.href.replace(/\/$/, canonical.pathname === "/" ? "/" : "");
}

function isNoIndex(html) {
  return [...html.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => attributes(tag)).some((attrs) => attrs.name?.toLowerCase() === "robots" && attrs.content?.toLowerCase().split(/[\s,]+/).includes("noindex"));
}

function editorialDate(html, file) {
  if (!file.startsWith("juegos/")) return "";
  const updatedTag = [...html.matchAll(/<time\b[^>]*>/gi)]
    .map(([tag]) => attributes(tag))
    .find((attrs) => attrs.id === "updatedAt");
  return /^\d{4}-\d{2}-\d{2}$/.test(updatedTag?.datetime || "") ? updatedTag.datetime : "";
}

function lastModified(file, html) {
  const declaredDate = editorialDate(html, file);
  if (declaredDate) return declaredDate;
  if (DATE_OVERRIDE) return DATE_OVERRIDE;
  if (PSPLUS_DATE_OVERRIDE && (file === "playstation-plus.html" || file.startsWith("playstation-plus/"))) return PSPLUS_DATE_OVERRIDE;
  try {
    const date = execFileSync("git", ["log", "-1", "--format=%cs", "--", file], { cwd: ROOT, encoding: "utf8" }).trim();
    if (date) return date;
  } catch {
    // Un archivo nuevo todavía sin commit usa la fecha actual.
  }
  return new Date().toISOString().slice(0, 10);
}

function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&apos;");
}

function pageOrder(page) {
  const pathname = new URL(page.loc).pathname;
  const fixed = new Map([["/", 0], ["/noticias", 1], ["/resenas", 4], ["/calendario", 6], ["/playstation-plus", 7], ["/sobre-mi", 9], ["/contacto", 10]]);
  if (fixed.has(pathname)) return [fixed.get(pathname), pathname];
  if (pathname.startsWith("/noticias/")) return [2, pathname];
  if (pathname.startsWith("/juegos/")) return [3, pathname];
  if (pathname.startsWith("/resenas/")) return [5, pathname];
  if (pathname.startsWith("/playstation-plus/")) return [8, pathname];
  return [11, pathname];
}

const pages = [];
for (const file of (await walk()).filter((file) => PUBLIC_PAGE.test(file)).sort()) {
  const html = await readFile(path.join(ROOT, file), "utf8");
  if (isNoIndex(html)) continue;
  pages.push({ file, loc: canonicalFrom(html, file), lastmod: lastModified(file, html) });
}

const duplicates = pages.filter((page, index) => pages.findIndex((candidate) => candidate.loc === page.loc) !== index);
if (duplicates.length) throw new Error(`URLs canónicas duplicadas: ${duplicates.map((page) => page.loc).join(", ")}`);

pages.sort((a, b) => {
  const [rankA, pathA] = pageOrder(a);
  const [rankB, pathB] = pageOrder(b);
  return rankA - rankB || pathA.localeCompare(pathB, "es");
});

const entries = pages.map(({ loc, lastmod }) => ["  <url>", `    <loc>${escapeXml(loc)}</loc>`, `    <lastmod>${lastmod}</lastmod>`, "  </url>"].join("\n"));
const sitemap = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...entries, "</urlset>", ""].join("\n");
await writeFile(OUTPUT, sitemap, "utf8");
console.log(`sitemap.xml generado con ${pages.length} URLs.`);

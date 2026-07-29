import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import {
  attributes,
  elementById,
  firstTag,
  monthKey,
  normalizeTitleHtml,
  releaseStateHash,
  releaseTitleFromHeading,
  slugify,
  sourceHost,
  stripHtml,
  tagInner,
  todayMadrid,
  topLevelDivs
} from "./calendar-utils.mjs";

const ROOT = process.cwd();
const CALENDAR_FILE = path.join(ROOT, "calendario.html");
const OUTPUT = path.join(ROOT, "data", "calendar.json");

const html = await readFile(CALENDAR_FILE, "utf8");
const root = elementById(html, "releases");
const releases = [];
let currentMonth = "";

function matchTag(block, pattern) {
  return pattern.exec(block)?.[0] || "";
}

function linkData(block, className) {
  const tag = matchTag(block, new RegExp(`<a\\b(?=[^>]*\\bclass=["'][^"']*\\b${className}\\b[^"']*["'])[^>]*>`, "i"));
  if (!tag) return null;
  const attrs = attributes(tag);
  return {
    url: attrs.href || "",
    title: attrs.title || "",
    ariaLabel: attrs["aria-label"] || ""
  };
}

function parseRelease(block, month) {
  const openAttrs = attributes(block.openTag);
  const headingHtml = normalizeTitleHtml(tagInner(block.outer, "h4"));
  const title = releaseTitleFromHeading(headingHtml);
  const imageTag = firstTag(block.outer, "img");
  const imageAttrs = attributes(imageTag);
  const dateHtml = tagInner(block.outer, "div", "rdate");
  const day = Number(stripHtml(tagInner(dateHtml, "b")));
  const platformsHtml = normalizeTitleHtml(tagInner(block.outer, "div", "platforms"));
  const platformKeys = String(openAttrs["data-plat"] || "").split(/\s+/).filter(Boolean);
  const badgeTag = matchTag(block.outer, /<span\b(?=[^>]*\bclass=["'][^"']*\bhype\b[^"']*["'])[^>]*>[\s\S]*?<\/span>/i);
  const badgeOpen = badgeTag.match(/^<span\b[^>]*>/i)?.[0] || "";
  const badgeAttrs = attributes(badgeOpen);
  const store = linkData(block.outer, "wish");
  const affiliate = linkData(block.outer, "store-cta");
  const review = linkData(block.outer, "tag-review");
  const tagText = stripHtml(tagInner(block.outer, "span", "tag-dlc"));
  const id = openAttrs["data-release-id"] || slugify(title);

  return {
    id,
    title,
    headingHtml,
    date: `${month}-${String(day).padStart(2, "0")}`,
    platformKeys,
    platformsHtml,
    image: {
      src: imageAttrs.src || "",
      alt: imageAttrs.alt || title,
      className: imageAttrs.class || "",
      gridArt: openAttrs["data-grid-art"] || "",
      poster: openAttrs["data-poster"] || "",
      legacy: true
    },
    store,
    affiliate,
    review,
    tag: tagText || null,
    badge: badgeTag ? {
      class: badgeAttrs.class || "hype",
      text: stripHtml(badgeTag)
    } : null,
    priority: 20,
    source: {
      url: store?.url || "",
      official: false,
      host: sourceHost(store?.url || ""),
      checkedAt: null
    },
    legacy: true
  };
}

for (const block of topLevelDivs(root.inner)) {
  const className = attributes(block.openTag).class || "";
  if (className.split(/\s+/).includes("month-label")) {
    currentMonth = attributes(block.openTag)["data-month"] || currentMonth;
    continue;
  }
  if (!className.split(/\s+/).includes("release") || !currentMonth) continue;
  releases.push(parseRelease(block, currentMonth));
}

function find(title) {
  return releases.find((release) => release.title === title || releaseTitleFromHeading(release.headingHtml) === title);
}

function setPlatforms(title, platformsHtml, platformKeys) {
  const release = find(title);
  if (!release) return;
  release.platformsHtml = platformsHtml;
  release.platformKeys = platformKeys.split(/\s+/).filter(Boolean);
}

function appendTag(release, text) {
  if (!release || release.tag) return;
  release.tag = text;
  release.headingHtml = `${release.headingHtml} <span class="tag-dlc">${text}</span>`;
}

function setBadge(release, className, text) {
  if (!release) return;
  release.badge = { class: `hype ${className}`, text };
  release.priority = className === "hype-max" ? 100 : className === "hype-high" ? 70 : 40;
}

// El calendario de mayo ya se eliminaba mediante un parche en tiempo de ejecución.
for (let index = releases.length - 1; index >= 0; index -= 1) {
  if (monthKey(releases[index].date) === "2026-05") releases.splice(index, 1);
}

setPlatforms("The Adventures of Elliot", "Switch 2 · PS5 · Xbox Series X|S · PC", "switch ps5 xbox pc");
setPlatforms("Dave the Diver", "Switch 2 · Switch · PS5 · PC", "switch ps5 pc");
setPlatforms("Granblue Fantasy: Relink", "PS5 · PS4 · PC", "ps5 ps4 pc");
setPlatforms("Deltarune: Chapter 5", "Switch 2 · Switch · PS5 · PS4 · PC", "switch ps5 ps4 pc");
setPlatforms("Silent Hill: Townfall", "PS5 · PC", "ps5 pc");
const onimusha = find("Onimusha: Way of the Sword");
if (onimusha) onimusha.date = "2026-09-04";

const doom = find("DOOM: The Dark Ages");
if (doom) {
  doom.title = "DOOM: The Dark Ages | Revelations";
  doom.headingHtml = 'DOOM: The Dark Ages | Revelations <span class="tag-dlc">DLC</span>';
  doom.image.src = "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3469450/706ca083d5768e3a6d01765b2c8974c10b1d771e/capsule_616x353.jpg";
  doom.image.alt = doom.title;
  doom.image.className = "";
  doom.image.gridArt = "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3469450/706ca083d5768e3a6d01765b2c8974c10b1d771e/capsule_616x353_2x.jpg";
}

const officialImages = new Map([
  ["Tomb Raider: Legacy of Atlantis", "https://gmedia.playstation.com/is/image/SIEPDC/Tomb-Raider-LoA-hero-desktop-01-en-27may26"],
  ["Persona 4 Revival", "https://www.sega.co.jp/en/release/images/260608_4/260608_5_01.jpg"],
  ["Fable", "https://pgfableweqzl6jpbr734gosa.blob.core.windows.net/blobpgfablewe-qzl6jpbr734go/uploads/massive_holland_hero_16x9_b28c45c830.png"]
]);
for (const [title, src] of officialImages) {
  const release = find(title);
  if (release) {
    release.image.src = src;
    release.image.className = "";
    release.image.legacy = false;
  }
}

const additions = [
  {
    id: "oblivion-remastered-switch-2",
    title: "The Elder Scrolls IV: Oblivion Remastered",
    headingHtml: 'The Elder Scrolls IV: Oblivion Remastered <span class="tag-dlc">Nueva plataforma</span>',
    date: "2026-08-11",
    platformKeys: ["switch"],
    platformsHtml: "Switch 2",
    image: { src: "https://www.nintendo.com/eu/media/images/assets/nintendo_switch_2_games/theelderscrollsivoblivionremastered/16x9_TheElderScrollsIVOblivionRemastered_image1600w.jpg", alt: "The Elder Scrolls IV: Oblivion Remastered", className: "", gridArt: "", poster: "", legacy: false },
    store: { url: "https://www.nintendo.com/es-es/Juegos/Juegos-de-Nintendo-Switch-2/The-Elder-Scrolls-IV-Oblivion-Remastered-3131244.html", title: "Ver en Nintendo", ariaLabel: "Ver en Nintendo: The Elder Scrolls IV: Oblivion Remastered" },
    affiliate: null, review: null, tag: "Nueva plataforma", badge: null, priority: 55,
    source: { url: "https://www.nintendo.com/es-es/Juegos/Juegos-de-Nintendo-Switch-2/The-Elder-Scrolls-IV-Oblivion-Remastered-3131244.html", official: true, host: "www.nintendo.com", checkedAt: "2026-07-27" }, legacy: false
  },
  {
    id: "elden-ring-tarnished-edition",
    title: "Elden Ring: Tarnished Edition",
    headingHtml: 'Elden Ring: Tarnished Edition <span class="tag-dlc">Nueva plataforma</span>',
    date: "2026-08-28",
    platformKeys: ["switch"],
    platformsHtml: "Switch 2",
    image: { src: "https://p325k7wa.twic.pics/high/elden-ring/elden-ring-tarnished-edition/00-product-page/ERTE-Header-Mobile-2.png?twic=v1/cover=1920x1080/quality=100", alt: "Elden Ring: Tarnished Edition", className: "", gridArt: "", poster: "", legacy: false },
    store: { url: "https://en.bandainamcoent.eu/elden-ring/elden-ring-tarnished-edition", title: "Ver ficha oficial", ariaLabel: "Ver ficha oficial: Elden Ring: Tarnished Edition" },
    affiliate: null, review: null, tag: "Nueva plataforma", badge: null, priority: 55,
    source: { url: "https://en.bandainamcoent.eu/elden-ring/elden-ring-tarnished-edition", official: true, host: "en.bandainamcoent.eu", checkedAt: "2026-07-27" }, legacy: false
  },
  {
    id: "captain-tsubasa-2-world-fighters",
    title: "Captain Tsubasa 2: World Fighters",
    headingHtml: "Captain Tsubasa 2: World Fighters",
    date: "2026-08-28",
    platformKeys: ["ps5", "xbox", "switch", "pc"],
    platformsHtml: "PS5 · Xbox Series X|S · Switch · PC",
    image: { src: "https://i.ytimg.com/vi/c6yniKaV6io/maxresdefault.jpg", alt: "Captain Tsubasa 2: World Fighters", className: "", gridArt: "", poster: "", legacy: true },
    store: { url: "https://en.bandainamcoent.eu/captain-tsubasa/captain-tsubasa-2-world-fighters", title: "Ver ficha oficial", ariaLabel: "Ver ficha oficial: Captain Tsubasa 2: World Fighters" },
    affiliate: null, review: null, tag: null, badge: { class: "hype hype-mid", text: "Interesante" }, priority: 40,
    source: { url: "https://en.bandainamcoent.eu/captain-tsubasa/captain-tsubasa-2-world-fighters", official: true, host: "en.bandainamcoent.eu", checkedAt: "2026-07-27" }, legacy: false
  },
  {
    id: "valheim-1-0",
    title: "Valheim 1.0",
    headingHtml: "Valheim 1.0",
    date: "2026-09-09",
    platformKeys: ["pc", "xbox", "ps5", "switch"],
    platformsHtml: "PC · Xbox · PS5 · Switch 2",
    image: { src: "https://img2.storyblok.com/fit-in/1920x1080/f/157036/6001x3323/1f79e49ebe/deep-north-art-2.jpg", alt: "Valheim 1.0", className: "", gridArt: "", poster: "", legacy: false },
    store: { url: "https://www.valheimgame.com/news/valheim-has-a-release-date-/", title: "Ver anuncio oficial", ariaLabel: "Ver anuncio oficial: Valheim 1.0" },
    affiliate: null, review: null, tag: null, badge: { class: "hype hype-high", text: "Hype alto" }, priority: 70,
    source: { url: "https://www.valheimgame.com/news/valheim-has-a-release-date-/", official: true, host: "www.valheimgame.com", checkedAt: "2026-07-27" }, legacy: false
  }
];
for (const addition of additions) {
  if (!releases.some((release) => release.id === addition.id || release.title === addition.title)) releases.push(addition);
}

const eventOfYear = new Set(["Grand Theft Auto VI"]);
const highHype = new Set([
  "Halo: Campaign Evolved", "Beast of Reincarnation", "Marvel Tōkon: Fighting Souls",
  "Resonance: A Plague Tale Legacy", "Star Wars Zero Company", "The Blood of Dawnwalker",
  "Marvel's Wolverine", "Silent Hill: Townfall", "Control Resonant", "Onimusha: Way of the Sword",
  "Ace Combat 8: Wings of Theve", "Gears of War: E-Day", "Castlevania: Belmont's Curse",
  "Phantom Blade Zero", "Tomb Raider: Legacy of Atlantis", "God of War Laufey",
  "Persona 4 Revival", "Fable", "Valheim 1.0"
]);
const interesting = new Set([
  "Mistfall Hunter", "Big Walk", "Duskfade", "The Sinking City 2", "Mortal Shell II",
  "Fire Emblem: Fortune's Weave", "Trails in the Sky 2nd Chapter", "EA Sports FC 27",
  "Minecraft Dungeons II", "Star Wars: Galactic Racer", "Final Fantasy Resonance",
  "Call of Duty: Modern Warfare 4", "Captain Tsubasa 2: World Fighters"
]);
const objectiveTags = new Map([
  ["Dune: Awakening", "Nueva plataforma"],
  ["Elden Ring: Tarnished Edition", "Nueva plataforma"],
  ["Metaphor: ReFantazio", "Nueva plataforma"],
  ["The Elder Scrolls IV: Oblivion Remastered", "Nueva plataforma"],
  ["Godzilla: Destroy All Monsters Melee", "Remaster"]
]);

for (const release of releases) {
  const objective = objectiveTags.get(release.title);
  if (objective) appendTag(release, objective);
  if (release.tag) {
    release.badge = null;
    release.priority = Math.max(release.priority || 0, 55);
  } else if (eventOfYear.has(release.title)) setBadge(release, "hype-max", "El evento del año");
  else if (highHype.has(release.title)) setBadge(release, "hype-high", "Hype alto");
  else if (interesting.has(release.title)) setBadge(release, "hype-mid", "Interesante");
}

releases.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title, "es"));
const today = todayMadrid();
const data = {
  updatedAt: today,
  region: "España y Europa",
  settings: {
    archiveMonths: 1,
    homeLimit: 5,
    countdownId: slugify("Grand Theft Auto VI"),
    homePinnedIds: [
      slugify("Halo: Campaign Evolved"),
      slugify("Beast of Reincarnation"),
      slugify("Resonance: A Plague Tale Legacy"),
      slugify("Star Wars Zero Company")
    ],
    allowedPlatforms: ["ps5", "ps4", "xbox", "switch", "pc"]
  },
  releases
};
data.renderState = releaseStateHash(data, today);

await mkdir(path.dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`Migrados ${releases.length} lanzamientos a data/calendar.json.`);

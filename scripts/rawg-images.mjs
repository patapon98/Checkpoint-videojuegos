import { sourceHost } from "./calendar-utils.mjs";

const RAWG_API_BASE = "https://api.rawg.io/api/";
const PLATFORM_SLUGS = {
  pc: new Set(["pc"]),
  ps5: new Set(["playstation5"]),
  ps4: new Set(["playstation4"]),
  xbox: new Set(["xbox-series-x", "xbox-one"]),
  switch: new Set(["nintendo-switch"])
};

export function normalizeRawgTitle(value = "") {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function isRawgProvider(image = {}) {
  return image.provider === "rawg";
}

export function isResolvedRawgImage(image = {}) {
  const host = sourceHost(image.src || "");
  return isRawgProvider(image)
    && Number(image.rawgId) > 0
    && Boolean(image.rawgSlug)
    && /^https:\/\/rawg\.io\/games\//.test(image.rawgPage || "")
    && /^https:\/\//.test(image.src || "")
    && (host === "media.rawg.io" || host.endsWith(".rawg.io"));
}

function platformScore(release, game) {
  const received = new Set((game.platforms || []).map((entry) => entry?.platform?.slug).filter(Boolean));
  let score = 0;
  for (const key of release.platformKeys || []) {
    const expected = PLATFORM_SLUGS[key];
    if (expected && [...expected].some((slug) => received.has(slug))) score += 1;
  }
  return score;
}

export function chooseRawgGame(release, results = []) {
  const requestedId = Number(release.image?.rawgId || 0);
  if (requestedId) {
    const explicit = results.find((game) => Number(game.id) === requestedId);
    if (!explicit) throw new Error(`RAWG no devolvió el ID ${requestedId}`);
    return explicit;
  }

  const expected = normalizeRawgTitle(release.image?.query || release.title);
  const exact = results.filter((game) => normalizeRawgTitle(game.name) === expected);
  if (!exact.length) throw new Error(`RAWG no encontró una coincidencia exacta para «${release.title}»`);
  if (exact.length === 1) return exact[0];

  const sameDate = exact.filter((game) => game.released === release.date);
  if (sameDate.length === 1) return sameDate[0];

  const ranked = exact
    .map((game) => ({ game, score: platformScore(release, game) }))
    .sort((a, b) => b.score - a.score);
  if (ranked[0]?.score > 0 && ranked[0].score > (ranked[1]?.score ?? -1)) return ranked[0].game;

  throw new Error(`RAWG devolvió varias coincidencias para «${release.title}»; declara image.rawgId`);
}

async function fetchRawgJson(url, fetchImpl) {
  const response = await fetchImpl(url, {
    redirect: "follow",
    headers: { "user-agent": "FinalSecreto-CalendarImages/1.0" }
  });
  if (!response.ok) throw new Error(`RAWG API HTTP ${response.status}`);
  return response.json();
}

function rawgUrl(pathname, apiKey, params = {}) {
  const url = new URL(pathname, RAWG_API_BASE);
  url.searchParams.set("key", apiKey);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  return url;
}

async function resolveRawgImageUrl(game, apiKey, fetchImpl) {
  if (/^https:\/\//.test(game.background_image || "")) {
    return { url: game.background_image, type: "background" };
  }

  const screenshots = await fetchRawgJson(
    rawgUrl(`games/${game.id}/screenshots`, apiKey, { page_size: 10 }),
    fetchImpl
  );
  const screenshot = (screenshots.results || []).find((item) => /^https:\/\//.test(item?.image || ""));
  if (!screenshot) throw new Error("RAWG no ofrece imagen principal ni capturas HTTPS para esta ficha");
  return { url: screenshot.image, type: "screenshot" };
}

export async function resolveRawgImage(release, { apiKey, fetchImpl = globalThis.fetch } = {}) {
  if (!isRawgProvider(release.image)) return false;
  if (!apiKey) throw new Error("RAWG_API_KEY no está configurada");
  if (typeof fetchImpl !== "function") throw new Error("No existe una implementación de fetch");

  let game;
  const rawgId = Number(release.image.rawgId || 0);
  if (rawgId) {
    game = await fetchRawgJson(rawgUrl(`games/${rawgId}`, apiKey), fetchImpl);
  } else {
    const payload = await fetchRawgJson(rawgUrl("games", apiKey, {
      search: release.image.query || release.title,
      search_exact: true,
      page_size: 10
    }), fetchImpl);
    game = chooseRawgGame(release, payload.results || []);
  }

  if (normalizeRawgTitle(game.name) !== normalizeRawgTitle(release.image.query || release.title)) {
    throw new Error(`la ficha RAWG corresponde a «${game.name}»`);
  }
  if (!game.slug) throw new Error("RAWG no devolvió un slug estable");

  const resolved = await resolveRawgImageUrl(game, apiKey, fetchImpl);
  const imageHost = sourceHost(resolved.url);
  if (!(imageHost === "media.rawg.io" || imageHost.endsWith(".rawg.io"))) {
    throw new Error(`RAWG devolvió una imagen desde un dominio inesperado: ${imageHost || "desconocido"}`);
  }

  const next = {
    ...release.image,
    provider: "rawg",
    rawgId: Number(game.id),
    rawgSlug: game.slug,
    rawgPage: `https://rawg.io/games/${game.slug}`,
    rawgImageType: resolved.type,
    src: resolved.url,
    alt: release.image.alt || release.title,
    className: release.image.className || "",
    legacy: false
  };
  const changed = JSON.stringify(next) !== JSON.stringify(release.image);
  release.image = next;
  return changed;
}

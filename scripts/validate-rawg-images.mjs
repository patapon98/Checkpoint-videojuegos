import assert from "node:assert/strict";
import { chooseRawgGame, resolveRawgImage } from "./rawg-images.mjs";

const release = {
  title: "Juego de prueba",
  date: "2026-08-04",
  platformKeys: ["ps5", "pc"],
  image: { provider: "rawg", query: "Juego de prueba", alt: "Juego de prueba" }
};

const candidates = [
  {
    id: 10,
    name: "Juego de prueba",
    slug: "juego-de-prueba-antiguo",
    released: "2024-01-01",
    background_image: "https://media.rawg.io/media/games/old.jpg",
    platforms: [{ platform: { slug: "pc" } }]
  },
  {
    id: 20,
    name: "Juego de prueba",
    slug: "juego-de-prueba",
    released: "2026-08-04",
    background_image: "https://media.rawg.io/media/games/new.jpg",
    platforms: [{ platform: { slug: "playstation5" } }, { platform: { slug: "pc" } }]
  }
];

assert.equal(chooseRawgGame(release, candidates).id, 20, "Debe preferir la coincidencia exacta con la misma fecha.");

const fetchImpl = async (url) => {
  assert.match(String(url), /api\.rawg\.io\/api\/games\?/);
  assert.match(String(url), /key=clave-de-prueba/);
  return {
    ok: true,
    async json() { return { results: candidates }; }
  };
};

const changed = await resolveRawgImage(release, { apiKey: "clave-de-prueba", fetchImpl });
assert.equal(changed, true);
assert.equal(release.image.rawgId, 20);
assert.equal(release.image.rawgSlug, "juego-de-prueba");
assert.equal(release.image.rawgPage, "https://rawg.io/games/juego-de-prueba");
assert.equal(release.image.src, "https://media.rawg.io/media/games/new.jpg");
assert.equal(release.image.legacy, false);

await assert.rejects(
  resolveRawgImage({ ...release, image: { provider: "rawg", query: "Otro juego" } }, {
    apiKey: "clave-de-prueba",
    fetchImpl: async () => ({ ok: true, async json() { return { results: candidates }; } })
  }),
  /coincidencia exacta/
);

console.log("Integración RAWG validada sin exponer una clave real ni depender de la red.");

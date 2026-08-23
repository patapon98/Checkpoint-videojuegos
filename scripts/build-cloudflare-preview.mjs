import { execFileSync } from "node:child_process";

const commands = [
  ["node", ["scripts/build-news-index.mjs"]],
  ["node", ["scripts/render-news.mjs"]],
  ["node", ["scripts/render-game-hubs.mjs"]],
  ["node", ["scripts/render-game-hub-pc-requirements.mjs"]],
  ["node", ["scripts/render-game-hub-editions.mjs"]],
  ["node", ["scripts/render-events.mjs"]],
];

for (const [command, args] of commands) {
  execFileSync(command, args, { stdio: "inherit" });
}

console.log("Superficies derivadas preparadas para Cloudflare.");

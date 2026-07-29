import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const data = JSON.parse(await readFile("data/calendar.json", "utf8"));
const target = data.releases.find((release) => release.id === "mistfall-hunter")
  || data.releases.find((release) => release.date >= data.updatedAt)
  || data.releases[0];

if (!target) throw new Error("No hay un lanzamiento con el que probar el estado diario.");

const files = ["calendario.html", "index.html"];
const original = new Map();
for (const file of files) original.set(file, await readFile(file, "utf8"));

try {
  const result = spawnSync(process.execPath, ["scripts/generate-release-calendar.mjs"], {
    encoding: "utf8",
    env: { ...process.env, CALENDAR_TODAY: target.date, TZ: "Europe/Madrid" }
  });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || "Falló el generador.");

  const calendar = await readFile("calendario.html", "utf8");
  const home = await readFile("index.html", "utf8");
  const marker = `data-release-id="${target.id}"`;
  const block = calendar.slice(calendar.indexOf(marker) - 80, calendar.indexOf(marker) + 2200);

  if (!block.includes("release-today")) throw new Error(`${target.title} no recibe la clase release-today.`);
  if (!block.includes('data-release-state="today"')) throw new Error(`${target.title} no declara el estado today.`);
  if (!block.includes("hype-today") || !block.includes(">Sale hoy</span>")) throw new Error(`${target.title} no muestra «Sale hoy».`);
  if (!calendar.includes("· lanzamiento hoy")) throw new Error("El encabezado mensual no indica que hay un lanzamiento hoy.");

  if (home.includes(marker)) {
    const homeBlock = home.slice(home.indexOf(marker) - 80, home.indexOf(marker) + 2200);
    if (!homeBlock.includes("release-today") || !homeBlock.includes(">Sale hoy</span>")) {
      throw new Error("La portada no hereda el estado Sale hoy.");
    }
  }

  console.log(`Estado «Sale hoy» validado con ${target.title} el ${target.date}.`);
} finally {
  for (const [file, content] of original) await writeFile(file, content, "utf8");
}

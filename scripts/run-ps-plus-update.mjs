import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const file = path.join(process.cwd(), "data", "playstation-plus.json");
const originalText = await readFile(file, "utf8");
const original = JSON.parse(originalText);
const originalIds = new Set(original.months.map((month) => month.id));
const now = new Date();
const currentId = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

await import("./update-ps-plus.mjs");

const updated = JSON.parse(await readFile(file, "utf8"));
updated.months = updated.months.filter((month) => originalIds.has(month.id) || month.id >= currentId);

const comparable = (data) => JSON.stringify({ ...data, updatedAt: "" });
if (comparable(updated) === comparable(original)) {
  await writeFile(file, originalText, "utf8");
  console.log("No hay novedades vigentes que requieran una PR.");
} else {
  updated.updatedAt = now.toISOString().slice(0, 10);
  await writeFile(file, JSON.stringify(updated, null, 2) + "\n", "utf8");
}

import { readFile, writeFile, unlink } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const sourcePath = path.join(process.cwd(), "scripts", "validate-game-hub-change.mjs");
const temporaryPath = path.join(process.cwd(), "scripts", ".validate-game-hub-change-with-pc.tmp.mjs");
const source = await readFile(sourcePath, "utf8");
const marker = "  'price'\n]);";
const replacement = "  'price',\n  'pcRequirements',\n  'editions'\n]);";

if (!source.includes(marker)) {
  throw new Error("No se encontró la lista de campos permitidos del validador incremental");
}

await writeFile(temporaryPath, source.replace(marker, replacement), "utf8");
try {
  const result = spawnSync(process.execPath, [temporaryPath], {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit"
  });
  process.exitCode = result.status ?? 1;
} finally {
  await unlink(temporaryPath).catch(() => {});
}

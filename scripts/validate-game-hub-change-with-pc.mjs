import { spawnSync } from "node:child_process";
import path from "node:path";

const validatorPath = path.join(process.cwd(), "scripts", "validate-game-hub-change.mjs");
const result = spawnSync(process.execPath, [validatorPath], {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit"
});

process.exitCode = result.status ?? 1;

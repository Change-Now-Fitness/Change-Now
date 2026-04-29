import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/**
 * Playwright global setup hook.
 *
 * How it fits:
 * - Runs once before `frontend/test/e2e/*.spec.ts`.
 * - Calls `backend/scripts/e2eSeed.js` to seed a known test user + baseline data in the test DB.
 * - Writes the resulting credentials to `.e2e-env.json` for the specs to read.
 */
type SeedOut = { email: string; password: string; userId: number };

export default async function globalSetup() {
  const repoRoot = path.resolve(__dirname, "../../..");
  const seedScript = path.join(repoRoot, "backend/scripts/e2eSeed.js");

  const stdout = execFileSync("node", [seedScript], {
    cwd: repoRoot,
    env: process.env,
    stdio: ["ignore", "pipe", "inherit"],
  }).toString("utf8");

  const trimmed = stdout.trim();
  const candidate = trimmed.lastIndexOf("\n") >= 0
    ? trimmed.slice(trimmed.lastIndexOf("\n") + 1)
    : trimmed;
  const seed = JSON.parse(candidate) as SeedOut;

  const outPath = path.join(__dirname, ".e2e-env.json");
  fs.writeFileSync(outPath, JSON.stringify(seed), "utf8");
}


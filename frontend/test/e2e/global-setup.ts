import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

type SeedOut = { email: string; password: string; userId: number };

export default async function globalSetup() {
  const repoRoot = path.resolve(__dirname, "../../..");
  const seedScript = path.join(repoRoot, "backend/scripts/e2eSeed.js");

  const stdout = execFileSync("node", [seedScript], {
    cwd: repoRoot,
    env: process.env,
    stdio: ["ignore", "pipe", "inherit"],
  }).toString("utf8");

  const seed = JSON.parse(stdout) as SeedOut;

  const outPath = path.join(__dirname, ".e2e-env.json");
  fs.writeFileSync(outPath, JSON.stringify(seed), "utf8");
}


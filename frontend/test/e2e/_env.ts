import fs from "node:fs";
import path from "node:path";

export type E2EEnv = { email: string; password: string; userId: number };

export function readE2EEnv(): E2EEnv {
  const envPath = path.join(__dirname, ".e2e-env.json");
  return JSON.parse(fs.readFileSync(envPath, "utf8")) as E2EEnv;
}


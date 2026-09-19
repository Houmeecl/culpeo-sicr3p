#!/usr/bin/env node
/**
 * Production Node server for a VPS (Caddy/Nginx in front).
 * Build first with: npm run build:vps
 */
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const server = join(root, ".output", "server", "index.mjs");

if (!existsSync(server)) {
  console.error(
    "[vps] Falta el build Node. Corre: npm run build:vps",
  );
  process.exit(1);
}

const env = {
  ...process.env,
  HOST: process.env.HOST ?? "127.0.0.1",
  PORT: process.env.PORT ?? "3000",
};

const child = spawn(process.execPath, [server], {
  cwd: root,
  env,
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("exit", (code) => process.exit(code ?? 1));

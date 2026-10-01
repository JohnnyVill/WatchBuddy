import { spawn } from "node:child_process";
import { startTmdbFixture } from "./fixtures/tmdb.mjs";
const fixture = await startTmdbFixture();
const port = process.env.TEST_APP_PORT || "3201";
const env = {
  ...process.env, TMDB_BASE_URL: fixture.url, TMDB_API_KEY: "fixture-token",
  SESSION_SECRET: "watchbuddy-browser-test-secret-32-bytes",
  UPSTASH_REDIS_REST_URL: "", UPSTASH_REDIS_REST_TOKEN: "",
  DATABASE_URL: process.env.TEST_DATABASE_URL || "postgres://invalid:invalid@127.0.0.1:1/test",
  DATABASE_SSL: "false", TEST_BASE_URL: `http://127.0.0.1:${port}`,
};
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--port", port, "--hostname", "127.0.0.1"], { env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
let serverLog = "";
for (const stream of [server.stdout, server.stderr]) stream.on("data", (chunk) => { serverLog = (serverLog + chunk).slice(-15000); });
try {
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (server.exitCode !== null) throw new Error("Test server exited: " + serverLog);
    try {
      const response = await fetch(env.TEST_BASE_URL + "/api/movies?category=popular", { signal: AbortSignal.timeout(2000) });
      if (response.ok) { ready = true; break; }
    } catch { /* Wait for the development server's first compilation. */ }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 500));
  }
  if (!ready) throw new Error("Test server did not become ready: " + serverLog);
  const tests = spawn(process.execPath, ["--test", "--test-concurrency=1", ...(process.env.TEST_NAME_PATTERN ? ["--test-name-pattern", process.env.TEST_NAME_PATTERN] : []), "tests/browser.test.mjs"], { env, windowsHide: true, stdio: "inherit" });
  process.exitCode = await new Promise((resolvePromise) => tests.once("exit", (code) => resolvePromise(code ?? 1)));
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally {
  server.kill();
  fixture.server.close();
  if (process.exitCode) console.error("Test server output:\n" + serverLog);
}

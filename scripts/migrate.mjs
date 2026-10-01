import { readdir, readFile } from "node:fs/promises";
import { Pool } from "pg";
if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before running migrations.");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_SSL === "false" ? false : true });
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(78241001)");
  await client.query("CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP)");
  const files = (await readdir(new URL("../migrations/", import.meta.url))).filter((file) => file.endsWith(".sql")).sort();
  for (const file of files) {
    const existing = await client.query("SELECT name FROM schema_migrations WHERE name = $1", [file]);
    if (existing.rows.length) continue;
    await client.query(await readFile(new URL(`../migrations/${file}`, import.meta.url), "utf8"));
    await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
    console.log(`Applied ${file}`);
  }
  await client.query("COMMIT");
} catch (error) { await client.query("ROLLBACK"); throw error; }
finally { client.release(); await pool.end(); }

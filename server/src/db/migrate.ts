import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import pool from "./pool.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "../../migrations");

// Track applied migrations in the database
const ensureMigrationsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT NOW()
    )
  `);
};

// Get list of already applied migrations
const getAppliedMigrations = async (): Promise<string[]> => {
  const result = await pool.query("SELECT name FROM migrations ORDER BY name");
  return result.rows.map((row) => row.name);
};

// Execute a single migration file
const runMigration = async (filename: string) => {
  const filePath = path.join(migrationsDir, filename);
  const sql = await fs.readFile(filePath, "utf-8");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query("INSERT INTO migrations (name) VALUES ($1)", [filename]);
    await client.query("COMMIT");
    console.log(`✓ Applied migration: ${filename}`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Run all pending migrations
export const migrate = async () => {
  await ensureMigrationsTable();

  const files = (await fs.readdir(migrationsDir))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const applied = await getAppliedMigrations();
  const pending = files.filter((f) => !applied.includes(f));

  if (pending.length === 0) {
    console.log("No pending migrations.");
    return;
  }

  console.log(`Running ${pending.length} migration(s)...`);
  for (const file of pending) {
    await runMigration(file);
  }
  console.log("All migrations applied successfully.");
};

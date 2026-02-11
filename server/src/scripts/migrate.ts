import "dotenv/config";
import { migrate } from "../db/migrate.js";
import pool from "../db/pool.js";

// Run migrations and exit
migrate()
  .then(() => {
    console.log("Migration complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });

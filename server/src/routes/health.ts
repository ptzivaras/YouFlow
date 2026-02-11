import { Router } from "express";

import pool from "../db/pool.js";

const router = Router();

router.get("/health", async (_req, res) => {
  if (process.env.NODE_ENV === "test") {
    res.status(200).json({ status: "ok", db: "skipped" });
    return;
  }

  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok", db: "ok" });
  } catch {
    res.status(503).json({ status: "degraded", db: "down" });
  }
});

export default router;

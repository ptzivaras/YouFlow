import { Router } from "express";

import {
  createService,
  deleteService,
  getService,
  listServices,
  updateService,
} from "../controllers/service.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";

const router = Router();

// Public endpoints
router.get("/", listServices);
router.get("/:id", getService);

// Admin-only endpoints
router.post("/", authenticate, requireAdmin, createService);
router.patch("/:id", authenticate, requireAdmin, updateService);
router.delete("/:id", authenticate, requireAdmin, deleteService);

export default router;

import { Router } from "express";

import {
  createBusiness,
  deleteBusiness,
  getBusiness,
  listBusinesses,
  updateBusiness,
} from "../controllers/business.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { validateBusiness } from "../middleware/validation.js";

const router = Router();

// Public endpoint to list businesses
router.get("/", listBusinesses);
router.get("/:id", getBusiness);

// Protected endpoints for admins
router.post("/", authenticate, requireAdmin, validateBusiness, createBusiness);
router.patch("/:id", authenticate, requireAdmin, updateBusiness);
router.delete("/:id", authenticate, requireAdmin, deleteBusiness);

export default router;

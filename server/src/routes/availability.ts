import { Router } from "express";

import {
  createSlot,
  deleteSlot,
  getSlot,
  listSlots,
  updateSlot,
} from "../controllers/slot.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { validateSlot } from "../middleware/validation.js";

const router = Router();

// Public endpoints - customers can view available slots
router.get("/", listSlots);
router.get("/:id", getSlot);

// Admin-only endpoints
router.post("/", authenticate, requireAdmin, validateSlot, createSlot);
router.patch("/:id", authenticate, requireAdmin, updateSlot);
router.delete("/:id", authenticate, requireAdmin, deleteSlot);

export default router;

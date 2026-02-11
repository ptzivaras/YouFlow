import { Router } from "express";

import {
  cancelReservation,
  createReservation,
  getReservation,
  listReservations,
  rescheduleReservation,
  updateReservationStatus,
} from "../controllers/reservation.controller.js";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import { validateReservation } from "../middleware/validation.js";

const router = Router();

// Customer endpoints - must be authenticated
router.post("/", authenticate, validateReservation, createReservation);
router.get("/", authenticate, listReservations);
router.get("/:id", authenticate, getReservation);
router.patch("/:id/reschedule", authenticate, rescheduleReservation);
router.delete("/:id", authenticate, cancelReservation);

// Admin-only endpoint to update status
router.patch("/:id/status", authenticate, requireAdmin, updateReservationStatus);

export default router;

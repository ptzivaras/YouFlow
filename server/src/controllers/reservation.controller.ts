import { Request, Response } from "express";

import * as reservationService from "../services/reservation.service.js";

// POST /reservations - create new reservation
export const createReservation = async (req: Request, res: Response) => {
  try {
    const { slot_id } = req.body;

    if (!slot_id) {
      res.status(400).json({ error: "slot_id is required" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const reservation = await reservationService.createReservation({
      user_id: req.user.userId,
      slot_id,
    });

    res.status(201).json(reservation);
  } catch (error) {
    if (error instanceof Error && error.message === "Slot not found") {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof Error && error.message === "Slot already booked") {
      res.status(409).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to create reservation" });
  }
};

// GET /reservations - list reservations
export const listReservations = async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : undefined;
    const status = req.query.status as string | undefined;

    const reservations = await reservationService.listReservations(userId, status);
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reservations" });
  }
};

// GET /reservations/:id - get single reservation
export const getReservation = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const reservation = await reservationService.getReservationById(id);
    res.status(200).json(reservation);
  } catch (error) {
    if (error instanceof Error && error.message === "Reservation not found") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to fetch reservation" });
  }
};

// PATCH /reservations/:id/status - update reservation status
export const updateReservationStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: "status is required" });
      return;
    }

    const reservation = await reservationService.updateReservationStatus(id, status);
    res.status(200).json(reservation);
  } catch (error) {
    if (error instanceof Error && error.message === "Reservation not found") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to update reservation" });
  }
};

// DELETE /reservations/:id - cancel and remove reservation
export const cancelReservation = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await reservationService.cancelReservation(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === "Reservation not found") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to cancel reservation" });
  }
};

// PATCH /reservations/:id/reschedule - move to different slot
export const rescheduleReservation = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { slot_id } = req.body;

    if (!slot_id) {
      res.status(400).json({ error: "slot_id is required" });
      return;
    }

    const reservation = await reservationService.rescheduleReservation(id, slot_id);
    res.status(200).json(reservation);
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Reservation not found" || error.message === "New slot not found")
    ) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof Error && error.message === "New slot already booked") {
      res.status(409).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to reschedule reservation" });
  }
};

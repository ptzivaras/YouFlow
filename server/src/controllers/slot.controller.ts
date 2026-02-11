import { Request, Response } from "express";

import * as slotService from "../services/slot.service.js";

// POST /availability - create new slot
export const createSlot = async (req: Request, res: Response) => {
  try {
    const { service_id, start_time, end_time } = req.body;

    if (!service_id || !start_time || !end_time) {
      res.status(400).json({ error: "service_id, start_time, and end_time are required" });
      return;
    }

    const slot = await slotService.createSlot({
      service_id,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
    });

    res.status(201).json(slot);
  } catch (error) {
    if (error instanceof Error && error.message === "End time must be after start time") {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to create slot" });
  }
};

// GET /availability - list slots with filters
export const listSlots = async (req: Request, res: Response) => {
  try {
    const serviceId = req.query.serviceId ? Number(req.query.serviceId) : undefined;
    const status = req.query.status as "available" | "booked" | undefined;

    const slots = await slotService.listSlots(serviceId, status);
    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch slots" });
  }
};

// GET /availability/:id - get single slot
export const getSlot = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const slot = await slotService.getSlotById(id);
    res.status(200).json(slot);
  } catch (error) {
    if (error instanceof Error && error.message === "Slot not found") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to fetch slot" });
  }
};

// PATCH /availability/:id - update slot
export const updateSlot = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { start_time, end_time, status } = req.body;

    const slot = await slotService.updateSlot(id, {
      start_time: start_time ? new Date(start_time) : undefined,
      end_time: end_time ? new Date(end_time) : undefined,
      status,
    });

    res.status(200).json(slot);
  } catch (error) {
    if (error instanceof Error && error.message === "Slot not found") {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof Error && error.message === "End time must be after start time") {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to update slot" });
  }
};

// DELETE /availability/:id - remove slot
export const deleteSlot = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await slotService.deleteSlot(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === "Slot not found") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to delete slot" });
  }
};

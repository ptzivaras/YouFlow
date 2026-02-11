import * as slotRepo from "../repositories/slot.repository.js";

type CreateSlotData = {
  service_id: number;
  start_time: Date;
  end_time: Date;
};

type UpdateSlotData = {
  start_time?: Date;
  end_time?: Date;
  status?: "available" | "booked";
};

export const createSlot = async (data: CreateSlotData) => {
  // Validate time range
  if (data.end_time <= data.start_time) {
    throw new Error("End time must be after start time");
  }

  return slotRepo.create(data);
};

export const getSlotById = async (id: number) => {
  const slot = await slotRepo.findById(id);
  if (!slot) {
    throw new Error("Slot not found");
  }
  return slot;
};

export const listSlots = async (serviceId?: number, status?: "available" | "booked") => {
  return slotRepo.findAll(serviceId, status);
};

export const updateSlot = async (id: number, data: UpdateSlotData) => {
  // Check time range if both are provided
  if (data.start_time && data.end_time && data.end_time <= data.start_time) {
    throw new Error("End time must be after start time");
  }

  const slot = await slotRepo.update(id, data);
  if (!slot) {
    throw new Error("Slot not found");
  }
  return slot;
};

export const deleteSlot = async (id: number) => {
  const deleted = await slotRepo.remove(id);
  if (!deleted) {
    throw new Error("Slot not found");
  }
};

import pool from "../db/pool.js";
import * as reservationRepo from "../repositories/reservation.repository.js";
import * as slotRepo from "../repositories/slot.repository.js";

type CreateReservationData = {
  user_id: number;
  slot_id: number;
};

export const createReservation = async (data: CreateReservationData) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if slot exists and is available
    const slotResult = await client.query("SELECT * FROM availability_slots WHERE id = $1 FOR UPDATE", [
      data.slot_id,
    ]);

    if (slotResult.rows.length === 0) {
      throw new Error("Slot not found");
    }

    const slot = slotResult.rows[0];
    if (slot.status === "booked") {
      throw new Error("Slot already booked");
    }

    // Create reservation
    const reservationResult = await client.query(
      "INSERT INTO reservations (user_id, slot_id) VALUES ($1, $2) RETURNING *",
      [data.user_id, data.slot_id]
    );

    // Mark slot as booked
    await client.query("UPDATE availability_slots SET status = 'booked', updated_at = NOW() WHERE id = $1", [
      data.slot_id,
    ]);

    await client.query("COMMIT");
    return reservationResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getReservationById = async (id: number) => {
  const reservation = await reservationRepo.findById(id);
  if (!reservation) {
    throw new Error("Reservation not found");
  }
  return reservation;
};

export const listReservations = async (userId?: number, status?: string) => {
  return reservationRepo.findAll(userId, status);
};

export const updateReservationStatus = async (id: number, status: string) => {
  const reservation = await reservationRepo.update(id, { status: status as any });
  if (!reservation) {
    throw new Error("Reservation not found");
  }
  return reservation;
};

// Cancel reservation and free up the slot
export const cancelReservation = async (id: number) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const reservationResult = await client.query("SELECT * FROM reservations WHERE id = $1 FOR UPDATE", [id]);

    if (reservationResult.rows.length === 0) {
      throw new Error("Reservation not found");
    }

    const reservation = reservationResult.rows[0];

    // Update reservation status
    await client.query("UPDATE reservations SET status = 'cancelled', updated_at = NOW() WHERE id = $1", [id]);

    // Free the slot
    await client.query(
      "UPDATE availability_slots SET status = 'available', updated_at = NOW() WHERE id = $1",
      [reservation.slot_id]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Reschedule to a different slot
export const rescheduleReservation = async (id: number, newSlotId: number) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Get current reservation
    const reservationResult = await client.query("SELECT * FROM reservations WHERE id = $1 FOR UPDATE", [id]);

    if (reservationResult.rows.length === 0) {
      throw new Error("Reservation not found");
    }

    const reservation = reservationResult.rows[0];
    const oldSlotId = reservation.slot_id;

    // Check new slot availability
    const newSlotResult = await client.query("SELECT * FROM availability_slots WHERE id = $1 FOR UPDATE", [
      newSlotId,
    ]);

    if (newSlotResult.rows.length === 0) {
      throw new Error("New slot not found");
    }

    const newSlot = newSlotResult.rows[0];
    if (newSlot.status === "booked") {
      throw new Error("New slot already booked");
    }

    // Update reservation with new slot
    await client.query("UPDATE reservations SET slot_id = $1, updated_at = NOW() WHERE id = $2", [
      newSlotId,
      id,
    ]);

    // Free old slot
    await client.query("UPDATE availability_slots SET status = 'available', updated_at = NOW() WHERE id = $1", [
      oldSlotId,
    ]);

    // Book new slot
    await client.query("UPDATE availability_slots SET status = 'booked', updated_at = NOW() WHERE id = $1", [
      newSlotId,
    ]);

    await client.query("COMMIT");

    return reservationRepo.findById(id);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const deleteReservation = async (id: number) => {
  const deleted = await reservationRepo.remove(id);
  if (!deleted) {
    throw new Error("Reservation not found");
  }
};

import pool from "../db/pool.js";

export type Reservation = {
  id: number;
  user_id: number;
  slot_id: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: Date;
  updated_at: Date;
};

type CreateReservationInput = {
  user_id: number;
  slot_id: number;
};

type UpdateReservationInput = {
  status?: "pending" | "confirmed" | "cancelled" | "completed";
};

export const create = async (data: CreateReservationInput): Promise<Reservation> => {
  const result = await pool.query(
    "INSERT INTO reservations (user_id, slot_id) VALUES ($1, $2) RETURNING *",
    [data.user_id, data.slot_id]
  );
  return result.rows[0];
};

export const findById = async (id: number): Promise<Reservation | null> => {
  const result = await pool.query("SELECT * FROM reservations WHERE id = $1", [id]);
  return result.rows[0] ?? null;
};

// Filter by user or status
export const findAll = async (userId?: number, status?: string): Promise<Reservation[]> => {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (userId) {
    conditions.push(`user_id = $${paramIndex++}`);
    values.push(userId);
  }

  if (status) {
    conditions.push(`status = $${paramIndex++}`);
    values.push(status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `SELECT * FROM reservations ${whereClause} ORDER BY created_at DESC`;

  const result = await pool.query(query, values);
  return result.rows;
};

export const update = async (id: number, data: UpdateReservationInput): Promise<Reservation | null> => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(data.status);
  }

  if (fields.length === 0) {
    return findById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `UPDATE reservations SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return result.rows[0] ?? null;
};

export const remove = async (id: number): Promise<boolean> => {
  const result = await pool.query("DELETE FROM reservations WHERE id = $1", [id]);
  return result.rowCount !== null && result.rowCount > 0;
};

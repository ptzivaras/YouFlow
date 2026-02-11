import pool from "../db/pool.js";

export type AvailabilitySlot = {
  id: number;
  service_id: number;
  start_time: Date;
  end_time: Date;
  status: "available" | "booked";
  created_at: Date;
  updated_at: Date;
};

type CreateSlotInput = {
  service_id: number;
  start_time: Date;
  end_time: Date;
};

type UpdateSlotInput = {
  start_time?: Date;
  end_time?: Date;
  status?: "available" | "booked";
};

export const create = async (data: CreateSlotInput): Promise<AvailabilitySlot> => {
  const result = await pool.query(
    "INSERT INTO availability_slots (service_id, start_time, end_time) VALUES ($1, $2, $3) RETURNING *",
    [data.service_id, data.start_time, data.end_time]
  );
  return result.rows[0];
};

export const findById = async (id: number): Promise<AvailabilitySlot | null> => {
  const result = await pool.query("SELECT * FROM availability_slots WHERE id = $1", [id]);
  return result.rows[0] ?? null;
};

// Filter by service and status
export const findAll = async (
  serviceId?: number,
  status?: "available" | "booked"
): Promise<AvailabilitySlot[]> => {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (serviceId) {
    conditions.push(`service_id = $${paramIndex++}`);
    values.push(serviceId);
  }

  if (status) {
    conditions.push(`status = $${paramIndex++}`);
    values.push(status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `SELECT * FROM availability_slots ${whereClause} ORDER BY start_time ASC`;

  const result = await pool.query(query, values);
  return result.rows;
};

export const update = async (id: number, data: UpdateSlotInput): Promise<AvailabilitySlot | null> => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.start_time !== undefined) {
    fields.push(`start_time = $${paramIndex++}`);
    values.push(data.start_time);
  }

  if (data.end_time !== undefined) {
    fields.push(`end_time = $${paramIndex++}`);
    values.push(data.end_time);
  }

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
    `UPDATE availability_slots SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return result.rows[0] ?? null;
};

export const remove = async (id: number): Promise<boolean> => {
  const result = await pool.query("DELETE FROM availability_slots WHERE id = $1", [id]);
  return result.rowCount !== null && result.rowCount > 0;
};

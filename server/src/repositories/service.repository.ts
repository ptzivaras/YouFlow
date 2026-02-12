import pool from "../db/pool.js";

export type Service = {
  id: number;
  business_id: number;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  created_at: Date;
  updated_at: Date;
};

type CreateServiceInput = {
  business_id: number;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
};

type UpdateServiceInput = {
  name?: string;
  description?: string;
  price?: number;
  duration_minutes?: number;
};

// Create service for a business
export const create = async (data: CreateServiceInput): Promise<Service> => {
  const result = await pool.query(
    "INSERT INTO services (business_id, name, description, price, duration_minutes) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [data.business_id, data.name, data.description ?? null, data.price, data.duration_minutes]
  );
  return result.rows[0];
};

// Get service by ID
export const findById = async (id: number): Promise<Service | null> => {
  const result = await pool.query("SELECT * FROM services WHERE id = $1", [id]);
  return result.rows[0] ?? null;
};

// Get all services, optionally filtered by business
export const findAll = async (businessId?: number): Promise<Service[]> => {
  if (businessId) {
    const result = await pool.query(
      "SELECT * FROM services WHERE business_id = $1 ORDER BY created_at DESC",
      [businessId]
    );
    return result.rows;
  }

  const result = await pool.query("SELECT * FROM services ORDER BY created_at DESC");
  return result.rows;
};

// Update service details
export const update = async (id: number, data: UpdateServiceInput): Promise<Service | null> => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }

  if (data.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(data.description);
  }

  if (data.price !== undefined) {
    fields.push(`price = $${paramIndex++}`);
    values.push(data.price);
  }

  if (data.duration_minutes !== undefined) {
    fields.push(`duration_minutes = $${paramIndex++}`);
    values.push(data.duration_minutes);
  }

  if (fields.length === 0) {
    return findById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `UPDATE services SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return result.rows[0] ?? null;
};

// Delete service
export const remove = async (id: number): Promise<boolean> => {
  const result = await pool.query("DELETE FROM services WHERE id = $1", [id]);
  return result.rowCount !== null && result.rowCount > 0;
};

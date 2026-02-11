import pool from "../db/pool.js";

export type Business = {
  id: number;
  owner_id: number;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
};

type CreateBusinessInput = {
  owner_id: number;
  name: string;
  description?: string;
};

type UpdateBusinessInput = {
  name?: string;
  description?: string;
};

// Create new business for admin user
export const create = async (data: CreateBusinessInput): Promise<Business> => {
  const result = await pool.query(
    "INSERT INTO businesses (owner_id, name, description) VALUES ($1, $2, $3) RETURNING *",
    [data.owner_id, data.name, data.description ?? null]
  );
  return result.rows[0];
};

// Get business by ID
export const findById = async (id: number): Promise<Business | null> => {
  const result = await pool.query("SELECT * FROM businesses WHERE id = $1", [id]);
  return result.rows[0] ?? null;
};

// Get all businesses with optional filtering
export const findAll = async (ownerId?: number): Promise<Business[]> => {
  if (ownerId) {
    const result = await pool.query("SELECT * FROM businesses WHERE owner_id = $1 ORDER BY created_at DESC", [
      ownerId,
    ]);
    return result.rows;
  }

  const result = await pool.query("SELECT * FROM businesses ORDER BY created_at DESC");
  return result.rows;
};

// Update business details
export const update = async (id: number, data: UpdateBusinessInput): Promise<Business | null> => {
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

  if (fields.length === 0) {
    return findById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await pool.query(
    `UPDATE businesses SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return result.rows[0] ?? null;
};

// Delete business and cascade to related data
export const remove = async (id: number): Promise<boolean> => {
  const result = await pool.query("DELETE FROM businesses WHERE id = $1", [id]);
  return result.rowCount !== null && result.rowCount > 0;
};

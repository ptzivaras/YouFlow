import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import env from "../config/env.js";
import pool from "../db/pool.js";

type UserRole = "customer" | "admin";

// Hash plain text password
const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

// Compare password with stored hash
const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Generate JWT token for authenticated user
const generateToken = (userId: number, role: UserRole): string => {
  return jwt.sign({ userId, role }, env.jwtSecret, { expiresIn: "7d" });
};

// Register new user account
export const register = async (email: string, password: string, role: UserRole = "customer") => {
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows.length > 0) {
    throw new Error("Email already registered");
  }

  const passwordHash = await hashPassword(password);
  const result = await pool.query(
    "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role",
    [email, passwordHash, role]
  );

  const user = result.rows[0];
  const token = generateToken(user.id, user.role);

  return { user, token };
};

// Authenticate user and return token
export const login = async (email: string, password: string) => {
  const result = await pool.query("SELECT id, email, password_hash, role FROM users WHERE email = $1", [
    email,
  ]);

  if (result.rows.length === 0) {
    throw new Error("Invalid credentials");
  }

  const user = result.rows[0];
  const valid = await verifyPassword(password, user.password_hash);

  if (!valid) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(user.id, user.role);

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

import { Request, Response } from "express";

import * as authService from "../services/auth.service.js";

// POST /auth/register - create new user account
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }

    const result = await authService.register(email, password, role);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Email already registered") {
      res.status(409).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Registration failed" });
  }
};

// POST /auth/login - authenticate and get token
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password required" });
      return;
    }

    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid credentials") {
      res.status(401).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Login failed" });
  }
};

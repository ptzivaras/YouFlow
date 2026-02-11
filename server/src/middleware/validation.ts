import { NextFunction, Request, Response } from "express";

// Validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

// Registration validation
export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  if (!isValidEmail(email)) {
    res.status(400).json({ error: "Invalid email format" });
    return;
  }

  if (!password) {
    res.status(400).json({ error: "Password is required" });
    return;
  }

  if (!isValidPassword(password)) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  next();
};

// Business creation validation
export const validateBusiness = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "Business name is required" });
    return;
  }

  if (name.length > 255) {
    res.status(400).json({ error: "Business name too long" });
    return;
  }

  next();
};

// Service creation validation
export const validateService = (req: Request, res: Response, next: NextFunction) => {
  const { business_id, name, duration_minutes } = req.body;

  if (!business_id || !Number.isInteger(business_id)) {
    res.status(400).json({ error: "Valid business_id is required" });
    return;
  }

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "Service name is required" });
    return;
  }

  if (!duration_minutes || !Number.isInteger(duration_minutes) || duration_minutes <= 0) {
    res.status(400).json({ error: "Valid duration_minutes is required" });
    return;
  }

  next();
};

// Availability slot validation
export const validateSlot = (req: Request, res: Response, next: NextFunction) => {
  const { service_id, start_time, end_time } = req.body;

  if (!service_id || !Number.isInteger(service_id)) {
    res.status(400).json({ error: "Valid service_id is required" });
    return;
  }

  if (!start_time) {
    res.status(400).json({ error: "start_time is required" });
    return;
  }

  if (!end_time) {
    res.status(400).json({ error: "end_time is required" });
    return;
  }

  const start = new Date(start_time);
  const end = new Date(end_time);

  if (isNaN(start.getTime())) {
    res.status(400).json({ error: "Invalid start_time format" });
    return;
  }

  if (isNaN(end.getTime())) {
    res.status(400).json({ error: "Invalid end_time format" });
    return;
  }

  if (end <= start) {
    res.status(400).json({ error: "end_time must be after start_time" });
    return;
  }

  next();
};

// Reservation creation validation
export const validateReservation = (req: Request, res: Response, next: NextFunction) => {
  const { slot_id } = req.body;

  if (!slot_id || !Number.isInteger(slot_id)) {
    res.status(400).json({ error: "Valid slot_id is required" });
    return;
  }

  next();
};

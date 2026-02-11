import { NextFunction, Request, Response } from "express";

// Custom error class with status code
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

// Global error handler middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);

  // Handle custom app errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // Handle validation errors from database constraints
  if (err.message.includes("violates unique constraint")) {
    res.status(409).json({ error: "Resource already exists" });
    return;
  }

  if (err.message.includes("violates foreign key constraint")) {
    res.status(400).json({ error: "Invalid reference to related resource" });
    return;
  }

  // Default to 500 server error
  res.status(500).json({ error: "Internal server error" });
};

// Handle 404 for unknown routes
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
};

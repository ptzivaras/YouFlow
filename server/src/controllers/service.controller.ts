import { Request, Response } from "express";

import * as serviceService from "../services/service.service.js";

// POST /services - create new service
export const createService = async (req: Request, res: Response) => {
  try {
    const { business_id, name, description, price, duration_minutes } = req.body;

    if (!business_id || !name || price === undefined || !duration_minutes) {
      res.status(400).json({ error: "business_id, name, price, and duration_minutes are required" });
      return;
    }

    const service = await serviceService.createService({
      business_id,
      name,
      description,
      price,
      duration_minutes,
    });

    res.status(201).json(service);
  } catch (error) {
    if (error instanceof Error && error.message === "Duration must be positive") {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to create service" });
  }
};

// GET /services - list all services
export const listServices = async (req: Request, res: Response) => {
  try {
    const businessId = req.query.businessId ? Number(req.query.businessId) : undefined;
    const services = await serviceService.listServices(businessId);
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
};

// GET /services/:id - get single service
export const getService = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const service = await serviceService.getServiceById(id);
    res.status(200).json(service);
  } catch (error) {
    if (error instanceof Error && error.message === "Service not found") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to fetch service" });
  }
};

// PATCH /services/:id - update service
export const updateService = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, description, price, duration_minutes } = req.body;

    const service = await serviceService.updateService(id, { name, description, price, duration_minutes });
    res.status(200).json(service);
  } catch (error) {
    if (error instanceof Error && error.message === "Service not found") {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof Error && error.message === "Duration must be positive") {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to update service" });
  }
};

// DELETE /services/:id - remove service
export const deleteService = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await serviceService.deleteService(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === "Service not found") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to delete service" });
  }
};

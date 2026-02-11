import { Request, Response } from "express";

import * as businessService from "../services/business.service.js";

// POST /businesses - create new business
export const createBusiness = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({ error: "Business name is required" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const business = await businessService.createBusiness({
      owner_id: req.user.userId,
      name,
      description,
    });

    res.status(201).json(business);
  } catch (error) {
    res.status(500).json({ error: "Failed to create business" });
  }
};

// GET /businesses - list all businesses
export const listBusinesses = async (req: Request, res: Response) => {
  try {
    const ownerId = req.query.ownerId ? Number(req.query.ownerId) : undefined;
    const businesses = await businessService.listBusinesses(ownerId);
    res.status(200).json(businesses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch businesses" });
  }
};

// GET /businesses/:id - get single business
export const getBusiness = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const business = await businessService.getBusinessById(id);
    res.status(200).json(business);
  } catch (error) {
    if (error instanceof Error && error.message === "Business not found") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to fetch business" });
  }
};

// PATCH /businesses/:id - update business
export const updateBusiness = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, description } = req.body;

    const business = await businessService.updateBusiness(id, { name, description });
    res.status(200).json(business);
  } catch (error) {
    if (error instanceof Error && error.message === "Business not found") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to update business" });
  }
};

// DELETE /businesses/:id - remove business
export const deleteBusiness = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await businessService.deleteBusiness(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === "Business not found") {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Failed to delete business" });
  }
};

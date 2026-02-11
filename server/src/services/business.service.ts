import * as businessRepo from "../repositories/business.repository.js";

type CreateBusinessData = {
  owner_id: number;
  name: string;
  description?: string;
};

type UpdateBusinessData = {
  name?: string;
  description?: string;
};

// Create new business
export const createBusiness = async (data: CreateBusinessData) => {
  return businessRepo.create(data);
};

// Get single business
export const getBusinessById = async (id: number) => {
  const business = await businessRepo.findById(id);
  if (!business) {
    throw new Error("Business not found");
  }
  return business;
};

// List all businesses or filter by owner
export const listBusinesses = async (ownerId?: number) => {
  return businessRepo.findAll(ownerId);
};

// Update business info
export const updateBusiness = async (id: number, data: UpdateBusinessData) => {
  const business = await businessRepo.update(id, data);
  if (!business) {
    throw new Error("Business not found");
  }
  return business;
};

// Remove business
export const deleteBusiness = async (id: number) => {
  const deleted = await businessRepo.remove(id);
  if (!deleted) {
    throw new Error("Business not found");
  }
};

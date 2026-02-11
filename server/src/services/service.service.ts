import * as serviceRepo from "../repositories/service.repository.js";

type CreateServiceData = {
  business_id: number;
  name: string;
  description?: string;
  duration_minutes: number;
};

type UpdateServiceData = {
  name?: string;
  description?: string;
  duration_minutes?: number;
};

// Create new service
export const createService = async (data: CreateServiceData) => {
  if (data.duration_minutes <= 0) {
    throw new Error("Duration must be positive");
  }
  return serviceRepo.create(data);
};

// Get service by ID
export const getServiceById = async (id: number) => {
  const service = await serviceRepo.findById(id);
  if (!service) {
    throw new Error("Service not found");
  }
  return service;
};

// List services with optional business filter
export const listServices = async (businessId?: number) => {
  return serviceRepo.findAll(businessId);
};

// Update service
export const updateService = async (id: number, data: UpdateServiceData) => {
  if (data.duration_minutes !== undefined && data.duration_minutes <= 0) {
    throw new Error("Duration must be positive");
  }

  const service = await serviceRepo.update(id, data);
  if (!service) {
    throw new Error("Service not found");
  }
  return service;
};

// Delete service
export const deleteService = async (id: number) => {
  const deleted = await serviceRepo.remove(id);
  if (!deleted) {
    throw new Error("Service not found");
  }
};

import apiClient from './client';

export interface Service {
  id: number;
  business_id: number;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateServiceDto {
  business_id: number;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  price?: number;
  duration_minutes?: number;
}

export const serviceApi = {
  async getAll(): Promise<Service[]> {
    const response = await apiClient.get('/services');
    return response.data;
  },

  async getById(id: number): Promise<Service> {
    const response = await apiClient.get(`/services/${id}`);
    return response.data;
  },

  async create(data: CreateServiceDto): Promise<Service> {
    const response = await apiClient.post('/services', data);
    return response.data;
  },

  async update(id: number, data: UpdateServiceDto): Promise<Service> {
    const response = await apiClient.patch(`/services/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/services/${id}`);
  },
};

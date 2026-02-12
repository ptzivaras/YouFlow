import apiClient from './client';

export interface Business {
  id: number;
  owner_id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface CreateBusinessRequest {
  name: string;
  description?: string;
}

export interface UpdateBusinessRequest {
  name?: string;
  description?: string;
}

export const businessApi = {
  getAll: async (): Promise<Business[]> => {
    const response = await apiClient.get<Business[]>('/businesses');
    return response.data;
  },

  getById: async (id: number): Promise<Business> => {
    const response = await apiClient.get<Business>(`/businesses/${id}`);
    return response.data;
  },

  create: async (data: CreateBusinessRequest): Promise<Business> => {
    const response = await apiClient.post<Business>('/businesses', data);
    return response.data;
  },

  update: async (id: number, data: UpdateBusinessRequest): Promise<Business> => {
    const response = await apiClient.patch<Business>(`/businesses/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/businesses/${id}`);
  },
};

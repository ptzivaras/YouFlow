import apiClient from './client';

export type SlotStatus = 'AVAILABLE' | 'BOOKED';

export interface AvailabilitySlot {
  id: number;
  service_id: number;
  start_time: string;
  end_time: string;
  status: SlotStatus;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSlotDto {
  service_id: number;
  start_time: string;
  end_time: string;
}

export interface UpdateSlotDto {
  start_time?: string;
  end_time?: string;
  status?: SlotStatus;
}

export const availabilitySlotApi = {
  async getAll(): Promise<AvailabilitySlot[]> {
    const response = await apiClient.get('/availability');
    return response.data;
  },

  async getById(id: number): Promise<AvailabilitySlot> {
    const response = await apiClient.get(`/availability/${id}`);
    return response.data;
  },

  async create(data: CreateSlotDto): Promise<AvailabilitySlot> {
    const response = await apiClient.post('/availability', data);
    return response.data;
  },

  async update(id: number, data: UpdateSlotDto): Promise<AvailabilitySlot> {
    const response = await apiClient.patch(`/availability/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/availability/${id}`);
  },
};

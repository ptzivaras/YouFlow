import apiClient from './client';

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Reservation {
  id: number;
  user_id: number;
  slot_id: number;
  status: ReservationStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReservationDto {
  slot_id: number;
  notes?: string;
}

export interface UpdateReservationDto {
  status?: ReservationStatus;
  notes?: string;
}

export const reservationApi = {
  async getAll(): Promise<Reservation[]> {
    const response = await apiClient.get('/reservations');
    return response.data;
  },

  async getById(id: number): Promise<Reservation> {
    const response = await apiClient.get(`/reservations/${id}`);
    return response.data;
  },

  async create(data: CreateReservationDto): Promise<Reservation> {
    const response = await apiClient.post('/reservations', data);
    return response.data;
  },

  async update(id: number, data: UpdateReservationDto): Promise<Reservation> {
    const response = await apiClient.patch(`/reservations/${id}`, data);
    return response.data;
  },

  async updateStatus(id: number, status: ReservationStatus): Promise<Reservation> {
    const response = await apiClient.patch(`/reservations/${id}/status`, { status });
    return response.data;
  },

  async cancel(id: number): Promise<void> {
    await apiClient.delete(`/reservations/${id}`);
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/reservations/${id}`);
  },
};

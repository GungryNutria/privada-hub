import api from './client';

export interface Reservation {
  id: number;
  houseId: number;
  house: {
    id: number;
    lotNumber: number;
    ownerName: string;
  };
  date: string;
  status: 'active' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export const reservationsApi = {
  getByMonth: async (year: number, month: number): Promise<Reservation[]> => {
    const response = await api.get(`/reservations/month?year=${year}&month=${month}`);
    return response.data;
  },

  getAvailableDates: async (year: number, month: number): Promise<string[]> => {
    const response = await api.get(`/reservations/available?year=${year}&month=${month}`);
    return response.data;
  },

  getByHouse: async (houseId: number): Promise<Reservation[]> => {
    const response = await api.get(`/reservations/house/${houseId}`);
    return response.data;
  },

  create: async (data: { houseId: number; date: string; notes?: string }): Promise<Reservation> => {
    const response = await api.post('/reservations', data);
    return response.data;
  },

  cancel: async (id: number, houseId: number): Promise<Reservation> => {
    const response = await api.post(`/reservations/${id}/cancel`, { houseId });
    return response.data;
  },
};
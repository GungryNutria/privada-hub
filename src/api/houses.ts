import api from './client';

export interface House {
  id: number;
  lotNumber: number;
  ownerName: string;
  phone?: string;
  active: boolean;
}

export const housesApi = {
  getAll: async (): Promise<House[]> => {
    const response = await api.get('/houses');
    return response.data;
  },

  getById: async (id: number): Promise<House> => {
    const response = await api.get(`/houses/${id}`);
    return response.data;
  },
};
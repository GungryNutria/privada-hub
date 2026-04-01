import api from './client';
import { User } from '../App';

export const authApi = {
  login: async (lotNumber: number, pin: string): Promise<{ success: boolean; house: User }> => {
    const response = await api.post('/auth/login', { lotNumber, pin });
    return response.data;
  },

  changePin: async (houseId: number, currentPin: string, newPin: string): Promise<{ success: boolean }> => {
    const response = await api.post('/auth/change-pin', { houseId, currentPin, newPin });
    return response.data;
  },
};
import { api } from '../model/generalData';

// replace with actual URL

export const getPlatforms = async () => {
  const response = await api.get(`/Platform`);
  return response.data;
};
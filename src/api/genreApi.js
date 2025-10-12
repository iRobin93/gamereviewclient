import { api } from '../model/generalData';

export const getGenres = async () => {
  const response = await api.get(`/Genre`);
  return response.data;
};


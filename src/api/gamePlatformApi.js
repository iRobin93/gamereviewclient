import { api } from '../model/generalData';

 // replace with actual URL

export const getGamePlatforms = async (id) => {
  const response = await api.get(`/GamePlatform?gameId=` + id );
  return response.data;
};

export const postGamePlatformToDatabase = async (newGamePlatform) => {

    await api.post(`/GamePlatform`, newGamePlatform);
  
};

export const deleteGamePlatformFromDatabase = async (id) => {
  try {
    await api.delete(`/GamePlatform/${id}`);
  } catch (error) {
    const message = error.response?.data || error.message;
    throw new Error(`Delete failed: ${message}`);
  }
};
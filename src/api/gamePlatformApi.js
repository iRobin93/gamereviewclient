import axios from 'axios';
import { BASE_URL } from '../model/generalData';

 // replace with actual URL

export const getGamePlatforms = async (id) => {
  const response = await axios.get(`${BASE_URL}/GamePlatform?gameId=` + id );
  return response.data;
};

export const postGamePlatformToDatabase = async (newGamePlatform) => {

    await axios.post(`${BASE_URL}/GamePlatform`, newGamePlatform);
  
};

export const deleteGamePlatformFromDatabase = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/GamePlatform/${id}`);
  } catch (error) {
    const message = error.response?.data || error.message;
    throw new Error(`Delete failed: ${message}`);
  }
};
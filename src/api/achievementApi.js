import axios from 'axios';
import { BASE_URL } from '../model/generalData'; 



export const getAchievements = async (userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/User/${userId}/achievements`);
    return response.data;
  } catch (err) {
    console.error('Failed to fetch achievements:', err);
    throw err; // Let the calling component handle the error
  }
};

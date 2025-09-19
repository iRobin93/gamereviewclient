import axios from 'axios';
import { BASE_URL } from '../model/generalData';

 // replace with actual URL

export const getGamePlatforms = async (id) => {
  const response = await axios.get(`${BASE_URL}/GamePlatform?gameId=` + id );
  return response.data;
};

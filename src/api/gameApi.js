import axios from 'axios';
import { BASE_URL } from '../model/generalData';

 // replace with actual URL

export const getGames = async () => {
  const response = await axios.get(`${BASE_URL}/Game` );
  return response.data;
};

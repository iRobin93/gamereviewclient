import axios from 'axios';
import { BASE_URL } from '../model/generalData';

 // replace with actual URL

export const getUserGames = async (id) => {
  const response = await axios.get(`${BASE_URL}/UserGame?userId=` + id );
  return response.data;
};

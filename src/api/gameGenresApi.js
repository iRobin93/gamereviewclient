import axios from 'axios';
import { BASE_URL } from '../model/generalData';

 // replace with actual URL

export const getGameGenres = async (id) => {
  const response = await axios.get(`${BASE_URL}/GameGenre?gameId=` + id );
  return response.data;
};

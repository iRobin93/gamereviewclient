import axios from 'axios';
import { BASE_URL } from '../model/generalData';

 // replace with actual URL

export const getGenres = async () => {
  const response = await axios.get(`${BASE_URL}/Genre` );
  return response.data;
};

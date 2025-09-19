import axios from 'axios';
import { BASE_URL } from '../model/generalData';

 // replace with actual URL

export const getPlatforms = async () => {
  const response = await axios.get(`${BASE_URL}/Platform` );
  return response.data;
};

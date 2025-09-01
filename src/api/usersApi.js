import axios from 'axios';
import { BASE_URL } from '../model/generalData'; 
 // replace with actual URL

export const getUsers = async () => {
  const response = await axios.get(`${BASE_URL}/User`);
  return response.data; // assuming it returns an array of users
};

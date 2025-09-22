import axios from 'axios';
import { BASE_URL } from '../model/generalData';

 // replace with actual URL

export const getGames = async () => {
  const response = await axios.get(`${BASE_URL}/Game` );
  return response.data;
};

export const postGameToDatabase = async (game) => {
  game.id = undefined;
  const response = await axios.post(`${BASE_URL}/Game` , game);
  game.id = response.data.id;
  return response.data;
};
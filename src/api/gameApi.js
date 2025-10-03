import axios from 'axios';
import { BASE_URL } from '../model/generalData';

 // replace with actual URL

export const getGames = async () => {
  const response = await axios.get(`${BASE_URL}/Game` );
  return response.data;
};
export const getGame = async (game_id) => {
  const response = await axios.get(`${BASE_URL}/Game/${game_id}` );
  return response.data;
};

export const postGameToDatabase = async (game) => {
  game.id = undefined;
  const response = await axios.post(`${BASE_URL}/Game` , game);
  game.id = response.data.id;
  return response.data;
};

export const updateAverageScore = async (gameId, averageScore) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/Game/${gameId}/average-score`,
      averageScore, // raw number, not an object
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating average score:', error);
    throw error;
  }
};

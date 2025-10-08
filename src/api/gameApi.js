import { api } from '../model/generalData';

 // replace with actual URL

export const getGames = async () => {
  const response = await api.get(`/Game` );
  return response.data;
};
export const getGame = async (game_id) => {
  const response = await api.get(`/Game/${game_id}` );
  return response.data;
};

export const postGameToDatabase = async (game) => {
  game.id = undefined;
  const response = await api.post(`/Game` , game);
  game.id = response.data.id;
  return response.data;
};

export const updateAverageScore = async (gameId, averageScore) => {
  try {
    const response = await api.put(
      `/Game/${gameId}/average-score`,
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

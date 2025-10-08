import { api } from '../model/generalData';

 // replace with actual URL

export const getGameGenres = async (GameId) => {
  const response = await api.get(`/GameGenre?gameId=` + GameId );
  return response.data;
};

export const postGameGenreToDatabase = async (newGameGenre) => {

    await api.post(`/GameGenre`, newGameGenre);
  
};

export const deleteGameGenreFromDatabase = async (id) => {
  try {
    await api.delete(`/GameGenre/${id}`);
  } catch (error) {
    const message = error.response?.data || error.message;
    throw new Error(`Delete failed: ${message}`);
  }
};
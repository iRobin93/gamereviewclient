import axios from 'axios';
import { BASE_URL } from '../model/generalData';

 // replace with actual URL

export const getGameGenres = async (id) => {
  const response = await axios.get(`${BASE_URL}/GameGenre?gameId=` + id );
  return response.data;
};

export const postGameGenreToDatabase = async (newGameGenre) => {

    await axios.post(`${BASE_URL}/GameGenre`, newGameGenre);
  
};

export const deleteGameGenreFromDatabase = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/GameGenre/${id}`);
  } catch (error) {
    const message = error.response?.data || error.message;
    throw new Error(`Delete failed: ${message}`);
  }
};
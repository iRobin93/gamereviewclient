import axios from 'axios';
import { BASE_URL } from '../model/generalData';

 // replace with actual URL

export const getUserGames = async (id) => {
  const response = await axios.get(`${BASE_URL}/UserGame?userId=` + id );
  return response.data;
};


export const deleteUserGame = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/UserGame/${id}`);
  } catch (error) {
    const message = error.response?.data || error.message;
    throw new Error(`Delete failed: ${message}`);
  }
};

export const postUserGameToDatabase = async (newUserGame) => {

    await axios.post(`${BASE_URL}/UserGame`, newUserGame);
  
};
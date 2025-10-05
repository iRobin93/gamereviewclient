import axios from 'axios';
import { BASE_URL } from '../model/generalData';

// replace with actual URL

export const getUserGamesByUserId = async (id) => {
  const response = await axios.get(`${BASE_URL}/UserGame?userId=` + id);
  return response.data;
};


export const getUserGamesByGameId = async (id) => {
  const response = await axios.get(`${BASE_URL}/UserGame?gameId=` + id);
  return response.data;
};

export const deleteUserGameFromDatabase = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/UserGame/${id}`);
  } catch (error) {
    const message = error.response?.data || error.message;
    throw new Error(`Delete failed: ${message}`);
  }
};

export const postUserGameToDatabase = async (newUserGame) => {
  newUserGame.id = undefined;
  const response = await axios.post(`${BASE_URL}/UserGame`, newUserGame);
  newUserGame.id = response.data.id;
  return response.data;
};


export const putUserGameToDatabase = async (id, userGameData) => {
  try {
    const response = await axios.put(`${BASE_URL}/UserGame/${id}`, userGameData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to PUT UserGame:', error);
    throw error;
  }
};



export const putUserGameReview = async (id, updatedUserGame) => {
  try {
    const response = await axios.put(`${BASE_URL}/UserGame/${id}`, updatedUserGame, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating review and recalculating average score:', error);
    if (error.response) {
      console.error('Backend response data:', error.response.data);
      console.error('Backend status:', error.response.status);
    }
    throw error;
  }
};

export const deleteUserGameReview = async (userGameId, userId) => {
  const res = await axios.delete(`${BASE_URL}/UserGame/${userGameId}/review`, {
    params: { userId },
  });
  return res.data;
};
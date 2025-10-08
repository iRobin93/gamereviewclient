import { api } from '../model/generalData';


export const getUserGamesByUserId = async (id) => {
  const response = await api.get(`/UserGame?userId=` + id);
  return response.data;
};


export const getUserGamesByGameId = async (id) => {
  const response = await api.get(`/UserGame?gameId=` + id);
  return response.data;
};


export const getAllUserGames = async () => {
  const response = await api.get(`/UserGame`);
  return response.data;
};

export const deleteUserGameFromDatabase = async (id) => {
  try {
    await api.delete(`/UserGame/${id}`);
  } catch (error) {
    const message = error.response?.data || error.message;
    throw new Error(`Delete failed: ${message}`);
  }
};

export const postUserGameToDatabase = async (newUserGame) => {
  newUserGame.id = undefined;
  const response = await api.post(`/UserGame`, newUserGame);
  newUserGame.id = response.data.id;
  return response.data;
};


export const putUserGameToDatabase = async (id, userGameData) => {
  try {
    const response = await api.put(`/UserGame/${id}`, userGameData, {
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
    const response = await api.put(`/UserGame/${id}`, updatedUserGame, {
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
  const res = await api.delete(`/UserGame/${userGameId}/review`, {
    params: { userId },
  });
  return res.data;
};
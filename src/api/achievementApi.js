import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api'; // replace with actual URL
const userId = 1;

export const getAchievements = async () => {
  const response = await axios.get(`${BASE_URL}/User/${userId}/achievements`);
  return response.data; // assuming it returns an array of users
};

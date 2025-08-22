import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api'; // replace with actual URL

export const getUsers = async () => {
  const response = await axios.get(`${BASE_URL}/User`);
  return response.data; // assuming it returns an array of users
};

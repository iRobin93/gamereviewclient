import axios from 'axios';
import { BASE_URL } from '../model/generalData';

 // replace with actual URL

export const getGenres = async () => {
  const response = await axios.get(`${BASE_URL}/Genre` );
  return response.data;
};

export const getGenresFromRawG = async () => {
   const response = await axios.get(`https://api.rawg.io/api/genres?key=b1a02be62e9140459f53df733ff56c1e`);
  return response.data;
}

export const postRawGGenresToDatabase = async (rawGGenresList) => {
  for (const genre of rawGGenresList) {
    const genreObject = {
  rawGId: genre.id,
  genreName: genre.name
}
    await axios.post(`${BASE_URL}/Genre`, genreObject);
  }
};


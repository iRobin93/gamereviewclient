import axios from 'axios';
import { api } from '../model/generalData';

export const getGenres = async () => {
  const response = await api.get(`/Genre`);
  return response.data;
};

export const getGenresFromRawG = async (apiURL) => {
  let response;
  if (apiURL != null) {
    response = await axios.get(apiURL);
  } else {
    response = await axios.get(`https://api.rawg.io/api/genres?key=b1a02be62e9140459f53df733ff56c1e`);
    
  }
return response.data;
}

export const postRawGGenresToDatabase = async (rawGGenresList) => {
  for (const genre of rawGGenresList) {
    const genreObject = {
      rawGId: genre.id,
      genreName: genre.name
    }
    await api.post(`/Genre`, genreObject);
  }
};


import axios from 'axios';
import { BASE_URL } from '../model/generalData';

 // replace with actual URL

export const getPlatforms = async () => {
  const response = await axios.get(`${BASE_URL}/Platform` );
  return response.data;
};

export const getPlatformsFromRawG = async () => {
   const response = await axios.get(`https://api.rawg.io/api/platforms?key=b1a02be62e9140459f53df733ff56c1e`);
  return response.data;
}

export const postRawGPlatformsToDatabase = async (rawGPlatformsList) => {
  for (const platform of rawGPlatformsList) {
    const platformObject = {
  rawGId: platform.id,
  platformName: platform.name
}
    await axios.post(`${BASE_URL}/Platform`, platformObject);
  }
};
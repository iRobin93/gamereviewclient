import axios from 'axios';
import { api } from '../model/generalData';

// replace with actual URL

export const getPlatforms = async () => {
  const response = await api.get(`/Platform`);
  return response.data;
};

export const getPlatformsFromRawG = async (apiURL) => {
  let response;
  if (apiURL != null) {
    response = await axios.get(apiURL);
  }
  else {
    response = await axios.get(`https://api.rawg.io/api/platforms?key=b1a02be62e9140459f53df733ff56c1e`);
  }
  return response.data;
}

export const postRawGPlatformsToDatabase = async (rawGPlatformsList) => {
  for (const platform of rawGPlatformsList) {
    const platformObject = {
      rawGId: platform.id,
      platformName: platform.name
    }
    await api.post(`/Platform`, platformObject);
  }
};

export const postOneRawGPlatformsToDatabase = async (rawGPlatform) => {
  const response = await api.post(`/Platform`, rawGPlatform);
  return response.data;
};
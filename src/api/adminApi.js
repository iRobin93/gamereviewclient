import { api } from '../model/generalData'; 



export const adminSyncFromRawGGenrePlatform = async () => {
  try {
    const response = await api.post(`/admin/sync/rawg`);
    return response;
  } catch (err) {
    console.error('Failed to sync:', err);
    throw err; // Let the calling component handle the error
  }
};

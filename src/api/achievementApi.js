import axios from 'axios';
import { BASE_URL } from '../model/generalData'; 
import { useUser } from '../context/UserContext';



export const getAchievements = async () => {
  const { user } = useUser();

        try {
        const response = await axios.get(`${BASE_URL}/User/${user.id}/achievements`); // replace with your URL
      } catch (err) {
        console.error('Failed to fetch achievements:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
  return response.data; // assuming it returns an array of users
};

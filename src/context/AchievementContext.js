import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../model/generalData'; 
import {getAchievements} from '../api/achievementApi'
const AchievementContext = createContext();

export function AchievementProvider({ children }) {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true); // optional
  const [error, setError] = useState(null);     // optional

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
       const responseData = await getAchievements();

        setAchievements(responseData);
      } catch (err) {
        console.error('Failed to fetch achievements:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  return (
    <AchievementContext.Provider value={{ achievements, setAchievements, loading, error }}>
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  return useContext(AchievementContext);
}

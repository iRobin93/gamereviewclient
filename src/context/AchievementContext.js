import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAchievements } from '../api/achievementApi';
import { useUser } from '../context/UserContext';

const AchievementContext = createContext();

export function AchievementProvider({ children }) {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();

  const refreshAchievements = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const responseData = await getAchievements(user.id);
      setAchievements(responseData);
    } catch (err) {
      console.error('Failed to fetch achievements:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial load or when user changes
  useEffect(() => {
    refreshAchievements();
  }, [refreshAchievements]);

  return (
    <AchievementContext.Provider value={{ achievements, loading, error, refreshAchievements }}>
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  return useContext(AchievementContext);
}

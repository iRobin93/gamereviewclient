import React, { useEffect } from 'react';
import { useAchievements } from '../context/AchievementContext';
import { useNavigate } from 'react-router-dom';
import { achievementLabels } from '../constants/achievementLabels';
import '../css/AchievementPage.css'; // 👈 Create this CSS file

const AchievementPage = () => {
  const { achievements, loading, error, refreshAchievements } = useAchievements();
  const navigate = useNavigate();

  useEffect(() => {
    refreshAchievements();
  }, [refreshAchievements]);

  return (
    <div className="achievement-page">
      <h2>🏅 Achievements</h2>
      <button onClick={() => navigate('/gamelistpage')} className="back-button">← Back</button>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error.message}</p>}

      <div className="achievement-list">
        {achievements.map((a, index) => {
          const label = achievementLabels[a.achievementType] || a.achievementType;
          return (
            <div key={index} className="achievement-card">
              <span className="achievement-icon">
                {label.slice(0, 2)} {/* Emoji */}
              </span>
              <span className="achievement-label">
                {label.slice(2)} {/* Label */}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementPage;

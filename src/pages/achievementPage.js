import React, { useEffect } from 'react';
import { useAchievements } from '../context/AchievementContext';
import { useNavigate } from 'react-router-dom';
import { achievementLabels } from '../constants/achievementLabels';
import '../css/AchievementPage.css';

const AchievementPage = () => {
  const { achievements, loading, error, refreshAchievements } = useAchievements();
  const navigate = useNavigate();

  useEffect(() => {
    refreshAchievements();
  }, [refreshAchievements]);

  return (
    <div className="achievement-page">
      <div className="achievement-header">
        <button onClick={() => navigate('/gamelistpage')} className="back-button">← Back</button>
        <h2>🏅 Achievements</h2>
      </div>

      {loading && <p className="status-text">Loading achievements...</p>}
      {error && <p className="status-text error-text">{error.message}</p>}

      <div className="achievement-list">
        {achievements.length === 0 && !loading ? (
          <p className="status-text">You have no achievements yet. Start reviewing and completing games!</p>
        ) : (
          achievements.map((a, index) => {
            const label = achievementLabels[a.achievementType] || a.achievementType;
            return (
              <div key={index} className="achievement-card">
                <div className="achievement-icon">
                  {label.icon}
                </div>
                <div className="achievement-info">
                  <h3>{label.title}</h3>
                  <p>{label.description}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AchievementPage;

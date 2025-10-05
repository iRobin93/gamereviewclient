import React, { useEffect } from "react";
import { useAchievements } from "../context/AchievementContext";
import { useNavigate } from "react-router-dom";
import { achievementLabels } from "../constants/achievementLabels";
import "../css/AchievementPage.css";

const AchievementPage = () => {
  const { achievements, loading, error, refreshAchievements } = useAchievements();
  const navigate = useNavigate();

  useEffect(() => {
    refreshAchievements();
  }, [refreshAchievements]);

  return (
    <div className="game-list-container">
      {/* --- HEADER SECTION --- */}
      <h2>🏅 Achievements</h2>

      {/* --- TOP BUTTONS --- */}
      <div className="top-buttons">
        <button onClick={() => navigate("/gamelistpage")} className="logout-button">
          ← Back to Games
        </button>
        <button onClick={refreshAchievements}>🔄 Refresh</button>
      </div>

      {/* --- STATUS MESSAGES --- */}
      {loading && <p className="status-text">Loading achievements...</p>}
      {error && <p className="status-text error-text">{error.message}</p>}

      {/* --- ACHIEVEMENT LIST --- */}
      <div className="game-list">
        {achievements.length === 0 && !loading ? (
          <p className="status-text">
            You have no achievements yet. Start reviewing and completing games!
          </p>
        ) : (
          achievements.map((a, index) => {
            const label = achievementLabels[a.achievementType] || a.achievementType;
            return (
              <div key={index} className="game-item">
                <div className="card-header">
                  <div className="status-icon" title={label.title}>
                    {label.icon}
                  </div>
                </div>

                <div className="game-details">
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

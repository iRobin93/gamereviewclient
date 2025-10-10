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
  <div className="achievement-container">
    {/* --- HEADER SECTION --- */}
    <h2 className="achievement-title">🏅 Achievements</h2>

    {/* --- TOP BUTTONS --- */}
    <div className="top-buttons-achievement">
      <button
        onClick={() => navigate("/gamelistpage")}
        className="logout-button-achievement button-achievement"
      >
        ← Back to Games
      </button>
      <button onClick={refreshAchievements} className="button-achievement">
        🔄 Refresh
      </button>
    </div>

    {/* --- STATUS MESSAGES --- */}
    {loading && <p className="status-text-achievement">Loading achievements...</p>}
    {error && (
      <p className="status-text-achievement error-text-achievement">{error.message}</p>
    )}

    {/* --- ACHIEVEMENT LIST --- */}
    <div className="achievement-list">
      {achievements.length === 0 && !loading ? (
        <p className="status-text-achievement">
          You have no achievements yet. Start reviewing and completing games!
        </p>
      ) : (
        achievements.map((a, index) => {
          const label = achievementLabels[a.achievementType] || a.achievementType;
          return (
            <div key={index} className="achievement-item">
              <div className="card-header-achievement">
                <div className="status-icon-achievement" title={label.title}>
                  {label.icon}
                </div>
              </div>

              <div className="achievement-details">
                <h3 className="achievement-title-item">{label.title}</h3>
                <p className="achievement-description">{label.description}</p>
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

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserGames } from '../context/UserGameContext';
import { useGames } from '../context/GameContext';
import { putUserGameReview } from '../api/userGamesApi';
import { fetchGame } from '../App';
import '../css/reviewPage.css';

function ReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usergames, setUsergamesNeedRefresh } = useUserGames();
  const { games, setGames } = useGames();

  const usergame = usergames.find(u => u.id === parseInt(id));
  const reviewGame = usergame ? games.find(g => g.id === parseInt(usergame.game_id)) : null;

  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);


  const [hoverRating, setHoverRating] = useState(0);


  useEffect(() => {
    const latestUserGame = usergames.find(u => u.id === parseInt(id));
    if (latestUserGame) {
      setReviewText(latestUserGame.reviewText || '');
      setRating(latestUserGame.rating || 0);
    }
  }, [usergames, id]);

  if (!usergame || !reviewGame) {
    return <div className="review-container"><p>Game not found.</p></div>;
  }

  const handleStarClick = (star) => setRating(star);

  const handleSave = async () => {
    try {
      const updatedUserGame = {
        reviewText,
        rating,
        reviewed: true,
        reviewedDate: new Date().toISOString(),
        status: usergame.status,
        user_id: usergame.user_id,
        game_id: usergame.game_id,
      };

      await putUserGameReview(usergame.id, updatedUserGame);
      fetchGame(setGames, games, usergame.game_id);
      setUsergamesNeedRefresh(true);
      navigate('/gamelistpage');
    } catch (error) {
      console.error('❌ Failed to save review:', error);
    }
  };

  return (
    <div className="review-page-container">
      {/* --- Game Header Section --- */}
      <div className="game-header">
        <img
          src={reviewGame.coverImageUrl}
          alt={reviewGame.title}
          className="game-cover"
        />
        <div className="game-header-overlay" />
        <h1 className="game-title">{reviewGame.title}</h1>
      </div>

      {/* --- Review Form Card --- */}
      <div className="review-card">
        <h2 className="review-title">Write Your Review</h2>

        <label htmlFor="reviewText" className="review-label">Your Review:</label>
        <textarea
          id="reviewText"
          className="review-textarea"
          rows={6}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="What did you think about this game?"
        />

        <label className="review-label">Your Rating:</label>
        <div className="review-stars-container">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className={`review-star ${star <= (hoverRating || rating) ? "filled" : ""
                }`}
              role="button"
              aria-label={`${star} star`}
            >
              ★
            </span>
          ))}
        </div>


        <div className="button-group">
          <button
            onClick={handleSave}
            className="save-btn"
            disabled={rating === 0 || reviewText.trim() === ''}
          >
            Save Review
          </button>
          <button onClick={() => navigate('/gamelistpage')} className="cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewPage;

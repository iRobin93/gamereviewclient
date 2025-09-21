import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserGames } from '../context/UserGameContext';
import { useGames } from '../context/GameContext';
import { useEffect } from 'react';


function ReviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usergames } = useUserGames();
  const { games } = useGames();
  // Find the game by id (id param is string, convert to number)
  const usergame = usergames.find(u => u.id === parseInt(id));
  const reviewGame = games.find(g => g.id === parseInt(usergame.game_id))
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);


useEffect(() => {
  setReviewText(usergame.reviewText);
  setRating(usergame.rating);
}, [usergame.reviewText, usergame.rating]);


  if (!usergame) {
    return <div>Game not found.</div>;
  }

  const handleStarClick = (star) => setRating(star);

  const handleSave = () => {
    console.log('Saving review for game', usergame.title, { reviewText, rating });
    // TODO: Save review logic here
    usergame.reviewText = reviewText;
    usergame.rating = rating;
    usergame.reviewed = true;
    navigate('/gamelistpage');
  };

  const handleCancel = () => {
    navigate('/gamelistpage');
  }

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>Review: {reviewGame.title}</h2>

      <label htmlFor="reviewText" style={{ display: 'block', marginBottom: '.5rem' }}>
        Your Review:
      </label>
      <textarea
        id="reviewText"
        rows={6}
        style={{ width: '100%', fontSize: '1rem', padding: '0.5rem', marginBottom: '1rem' }}
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        placeholder="Write your thoughts about the game here..."
      />

      <label style={{ display: 'block', marginBottom: '.5rem' }}>Your Rating:</label>
      <div style={{ fontSize: '2rem', cursor: 'pointer', marginBottom: '1rem' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            onClick={() => handleStarClick(star)}
            style={{ color: star <= rating ? 'gold' : '#ccc' }}
            role="button"
            aria-label={`${star} star`}
          >
            ★
          </span>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={rating === 0 || reviewText.trim() === ''}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: rating === 0 || reviewText.trim() === '' ? '#aaa' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: rating === 0 || reviewText.trim() === '' ? 'not-allowed' : 'pointer',
        }}
      >
        Save Review
      </button>
      <button
        onClick={handleCancel}
        style={{
          marginLeft: '20rem',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      > Cancel</button>
    </div>
  );
}

export default ReviewPage;

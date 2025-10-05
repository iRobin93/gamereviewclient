import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../css/viewReviewPage.css";
import { useGenres } from "../context/GenreContext";
import { usePlatforms } from "../context/PlatformContext";
import { useGameGenres } from "../context/GameGenreContext";
import { useGamePlatforms } from "../context/GamePlatformContext";
import { useUser } from "../context/UserContext";
import { useUserGames } from "../context/UserGameContext";
import { useGames } from "../context/GameContext";
import { getUserGamesByGameId, putUserGameToDatabase } from "../api/userGamesApi";

export default function ViewReviewPage() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { genres } = useGenres();
  const { platforms } = usePlatforms();
  const { gamegenres } = useGameGenres();
  const { gameplatforms } = useGamePlatforms();
  const { setGamesNeedRefresh } = useGames();
  const { setUserGames } = useUserGames();

  const game = location.state?.game;
  const fromGameReview = location.state?.fromGameReview || false;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);

  // ✅ Fetch reviews for this game
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const responseData = await getUserGamesByGameId(gameId);
        setReviews(responseData);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Could not fetch reviews 😞");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [gameId]);

  // ✅ Delete a review (only for owner/admin)
  const handleDeleteReview = async (userGame) => {
    if (!window.confirm("Are you sure you want to remove this review text?")) return;

    try {
      setUserGames((prev) =>
        prev.map((r) =>
          r.id === userGame.id
            ? { ...r, reviewText: null, rating: null, reviewed: false }
            : r
        )
      );
      setReviews((prev) => prev.filter((r) => r.id !== userGame.id));
      setGamesNeedRefresh(true);

      const updated = { ...userGame, reviewed: false, reviewText: null, rating: null };
      await putUserGameToDatabase(userGame.id, updated);
    } catch (err) {
      console.error("Error clearing review:", err);
      alert("Failed to clear review ❌");
    }
  };

  // ✅ Helpers to get genre/platform names
  const getGameGenres = (gameId) => {
    const links = gamegenres?.filter((g) => g.game_id === gameId) || [];
    return links
      .map((link) => genres?.find((g) => g.id === link.genre_id)?.genreName)
      .filter(Boolean)
      .join(", ");
  };

  const getGamePlatforms = (gameId) => {
    const links = gameplatforms?.filter((p) => p.game_id === gameId) || [];
    return links
      .map((link) => platforms?.find((p) => p.id === link.platform_id)?.platformName)
      .filter(Boolean)
      .join(", ");
  };

  // ✅ Status icon helper
  const renderStatusIcon = (status) => {
    switch (status) {
      case "Finished":
        return "✅ Finished";
      case "InProgress":
        return "🕹️ In Progress";
      default:
        return "❌ Not Started";
    }
  };

  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="review-page-container">
      <button onClick={() => navigate(-1)} className="back-button">
        ← Back
      </button>

      {game && (
        <div className="game-header">
          <img
            src={game.coverImageUrl}
            alt={game.title}
            className="review-game-cover"
          />

          <div className="game-info">
            <h2>🎮 {game.title}</h2>

            <div className="game-meta">
              {!fromGameReview && (
                <div className="meta-item">
                  <strong>Status:</strong> {renderStatusIcon(game.status)}
                </div>
              )}
              <div className="meta-item">
                <strong>Platform:</strong> {getGamePlatforms(game.id) || "N/A"}
              </div>
              <div className="meta-item">
                <strong>Genre:</strong> {getGameGenres(game.id) || "N/A"}
              </div>
              <div className="meta-item">
                <strong>Release Date:</strong>{" "}
                {game.releaseDate
                  ? new Date(game.releaseDate).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "N/A"}
              </div>
            </div>

            <p className="average-rating">
              <strong>Average Review Score:</strong>{" "}
              {game.averageReviewScore?.toFixed(1) ?? "0"} / 5.0{" "}
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className="star">
                  {i < Math.round(game.averageReviewScore ?? 0) ? "★" : "☆"}
                </span>
              ))}
            </p>
          </div>
        </div>
      )}

      <h3>📝 Reviews</h3>
      {reviews.length === 0 ? (
        <p>No reviews found for this game.</p>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <h4>{review.username || "Anonymous"}</h4>
              <p>
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className="star">
                    {i < review.rating ? "★" : "☆"}
                  </span>
                ))}
                <span className="rating-text"> {review.rating}/5</span>
              </p>
              <p>{review.reviewText}</p>
              {review.reviewedDate && (
                <p className="review-date">
                  {new Date(review.reviewedDate).toLocaleDateString("en-GB")}
                </p>
              )}
              {review.user_id === user.id && (
                <button
                  className="delete-review-button"
                  onClick={() => handleDeleteReview(review)}
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

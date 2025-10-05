import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../css/viewReviewPage.css";
import { useGenres } from "../context/GenreContext";
import { usePlatforms } from "../context/PlatformContext";
import { useGameGenres } from "../context/GameGenreContext";
import { useGamePlatforms } from "../context/GamePlatformContext";
import { useUser } from "../context/UserContext";
import { useUserGames } from "../context/UserGameContext.js";
import { putUserGameToDatabase } from "../api/userGamesApi.js";
import { getUserGamesByGameId } from "../api/userGamesApi.js"
import { useGames } from '../context/GameContext';

export default function ViewReviewPage() {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useUser();
    const { gamegenres } = useGameGenres();
    const { gameplatforms } = useGamePlatforms();
    const { genres } = useGenres();
    const { platforms } = usePlatforms();
    const { setGamesNeedRefresh} = useGames();
    const game = location.state?.game;
    const fromGameReview = location.state?.fromGameReview || false;

    const {setUserGames } = useUserGames();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reviewUsergames, setReviewUserGames] = useState([]);

    // ✅ Fetch reviews
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const responseData = await getUserGamesByGameId(gameId);
                setReviewUserGames(responseData);
            } catch (err) {
                console.error("Error fetching reviews:", err);
                setError("Could not fetch reviews 😞");
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [gameId]);

    // ✅ Delete review (admin only)
    // ✅ "Clear" review (admin only)
    const handleDeleteReview = async (userGame) => {
        if (!window.confirm("Are you sure you want to remove this review text?")) return;

        try {
            setUserGames((prev) =>
                prev.map((r) => (r.id === userGame.id ? { ...r, reviewText: null, rating: null, reviewed: false } : r))
            );
            setReviewUserGames((prev) =>
                prev.filter((r) => r.id !== userGame.id)
            );
            setGamesNeedRefresh(true);
            userGame.reviewed = false;
            userGame.reviewText = null;
            userGame.rating = null;
            await putUserGameToDatabase(userGame.id, userGame);
        } catch (err) {
            console.error("Error clearing review:", err);
            alert("Failed to clear review ❌");
        }
    };


    const getGameGenres = (gameId) => {
        const genreLinks = gamegenres?.filter((g) => g.game_id === gameId) || [];
        const genreNames = genreLinks
            .map((link) => genres?.find((g) => g.id === link.genre_id)?.genreName || null)
            .filter(Boolean);
        return genreNames.join(", ");
    };

    const getGamePlatforms = (gameId) => {
        const platformLinks = gameplatforms?.filter((p) => p.game_id === gameId) || [];
        const platformNames = platformLinks
            .map((link) => platforms?.find((p) => p.id === link.platform_id)?.platformName || null)
            .filter(Boolean);
        return platformNames.join(", ");
    };

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

                        {!fromGameReview && (
                            <p>
                                <strong>Status:</strong> {renderStatusIcon(game.status)}
                            </p>
                        )}

                        <p>
                            <strong>Platform:</strong> {getGamePlatforms(game.id) || "N/A"}
                        </p>
                        <p>
                            <strong>Genre:</strong> {getGameGenres(game.id) || "N/A"}
                        </p>
                        <p>
                            <strong>Release Date:</strong>{" "}
                            {game.releaseDate
                                ? new Date(game.releaseDate).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                })
                                : "N/A"}
                        </p>

                        <p className="average-rating">
                            <strong>Average Review Score:</strong>{" "}
                            {game.averageReviewScore?.toFixed(1) ?? "0"} / 5.0{" "}
                            {Array.from({ length: 5 }, (_, i) => (
                                <span key={i} className="star">
                                    {i < Math.round(game.averageReviewScore ?? 0)
                                        ? "★"
                                        : "☆"}
                                </span>
                            ))}
                        </p>
                    </div>
                </div>
            )}

            <h3>📝 Reviews</h3>
            {reviewUsergames.length === 0 ? (
                <p>No reviews found for this game.</p>
            ) : (
                <div className="reviews-list">
                    {reviewUsergames.map((review) => (
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

                            {/* ✅ Only show delete if user is admin */}
                            {(review.user_id === user.id) && (
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

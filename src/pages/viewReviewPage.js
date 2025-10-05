import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "../model/generalData.js";
import axios from "axios";
import "../css/viewReviewPage.css";
import { useGenres } from "../context/GenreContext";
import { usePlatforms } from "../context/PlatformContext";
import { useGameGenres } from "../context/GameGenreContext";
import { useGamePlatforms } from "../context/GamePlatformContext";

export default function ViewReviewPage() {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const { gamegenres } = useGameGenres();
    const { gameplatforms } = useGamePlatforms();
    const { genres } = useGenres();
    const { platforms } = usePlatforms();

    const game = location.state?.game;
    const fromGameReview = location.state?.fromGameReview || false;

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/UserGame/Game/${gameId}`);
                setReviews(response.data);
            } catch (err) {
                console.error("Error fetching reviews:", err);
                setError("Could not fetch reviews 😞");
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [gameId]);

    const getGameGenres = (gameId) => {
        const genreLinks = gamegenres.filter((g) => g.game_id === gameId);
        const genreNames = genreLinks
            .map((link) => {
                const genre = genres.find((g) => g.id === link.genre_id);
                return genre ? genre.genreName : null;
            })
            .filter(Boolean);
        return genreNames.join(", ");
    };

    const getGamePlatforms = (gameId) => {
        const platformLinks = gameplatforms.filter((p) => p.game_id === gameId);
        const platformNames = platformLinks
            .map((link) => {
                const platform = platforms.find((p) => p.id === link.platform_id);
                return platform ? platform.platformName : null;
            })
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

                        {/* Hide status if coming from GameReviewGames */}
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
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

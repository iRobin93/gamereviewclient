import React, { useState } from 'react';
import './GameListPage.css';
import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useGames } from '../context/GameContext';
import { useUserGames } from '../context/UserGameContext';
import { useGameGenres } from '../context/GameGenreContext';
import { useGamePlatforms } from '../context/GamePlatformContext';
import { useGenres } from '../context/GenreContext';
import {usePlatforms} from '../context/PlatformContext'

function GameListPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [editingStatusId, setEditingStatusId] = useState(null);
  const { games, setGames } = useGames();
  const {usergames, setUserGames} = useUserGames();
  const { gamegenres, setGameGenres } = useGameGenres();
  const { gameplatforms, setGamePlatforms } = useGamePlatforms();
  const [filter, setFilter] = useState('');
  const dropdownRef = useRef(null);
  const {genres} = useGenres();
  const {platforms} = usePlatforms();


  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setEditingStatusId(null);
      }
    };

    if (editingStatusId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingStatusId]);

  if (!user) {
    return null; // or a spinner
  }


  const updateStatus = (id, newStatus) => {
    setUserGames((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: newStatus } : g))
    );
    setEditingStatusId(null); // close dropdown
  };


  const getGameGenres = (gameId) => {

      const genreLinks = gamegenres.filter(g => g.game_id === gameId);

      const genreNames = genreLinks.map(link => {
        const genre = genres.find(g => g.id === link.genre_id);
        return genre ? genre.genreName : null;
      }).filter(name => name !== null);

      return genreNames.join(', ');
  }

   const getGamePlatforms = (gameId) => {

      const gamePlatformList = gameplatforms.filter(g => g.game_id === gameId);

      const platformNames = gamePlatformList.map(gamePlatform => {
        const platform = platforms.find(p => p.id === gamePlatform.platform_id);
        return platform ? platform.platformName : null;
      }).filter(name => name !== null);

      return platformNames.join(', ');
  }

  const handleAchievement = () => {
    navigate(`/achievementpage`);
  };

  const handleAddGame = () => {
    navigate(`/addgamepage`);
  };

  const handleReview = (id) => {
    navigate(`/reviewpage/${id}`);
  };

  const filteredUserGames = usergames
    .filter(userGame => userGame.user_id === user.id)
    .filter(userGame => {
      const game = games.find(g => g.id === userGame.game_id);
      return game && game.title.toLowerCase().includes(filter.toLowerCase());
    })
    .map(userGame => {
      const game = games.find(g => g.id === userGame.game_id);
      return {
        ...game,
        status: userGame.status,
        reviewed: userGame.reviewed
      };
    });



  return (
    <div className="game-list-container">
      <h2>🎮 Game List</h2>
      <button onClick={handleAchievement}>Achievements </button>
      <input
        type="text"
        placeholder="Filter by title..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="filter-input"
      />

      <div className="game-list">
        {filteredUserGames.map((game) => (
          <div key={game.id} className="game-item">
            <div className="status-column">
              <div title="Completion Status" className="status-cell">
                {editingStatusId === game.id ? (
                  <div ref={dropdownRef} className="custom-dropdown">
                    <div className="dropdown-selected">
                      {game.status === 'Finished'
                        ? '✅ Completed'
                        : game.status === 'InProgress'
                          ? '🕹️ Started'
                          : '❌ Not Started'}
                    </div>
                    <div
                      className="dropdown-option"
                      onClick={() => updateStatus(game.id, 'NotStarted')}
                    >
                      ❌ Not Started
                    </div>
                    <div
                      className="dropdown-option"
                      onClick={() => updateStatus(game.id, 'InProgress')}
                    >
                      🕹️ Started
                    </div>
                    <div
                      className="dropdown-option"
                      onClick={() => updateStatus(game.id, 'Finished')}
                    >
                      ✅ Completed
                    </div>
                  </div>
                ) : (
                  <span
                    onClick={() =>
                      setEditingStatusId(editingStatusId === game.id ? null : game.id)
                    }
                    style={{ cursor: 'pointer' }}
                  >
                    {game.status === 'Finished'
                      ? '✅'
                      : game.status === 'InProgress'
                        ? '🕹️'
                        : '❌'}
                  </span>
                )}

              </div>
              <div title="Review Status">
                {game.reviewed ? '📝' : '✏️'}
              </div>
            </div>

            <img src={game.coverImageUrl} alt={game.title} className="cover-image" />

            <div className="game-details">
              <h3>{game.title}</h3>
              <p><strong>Genre:</strong> {getGameGenres(game.id)}</p>
              <p><strong>Platform:</strong> {getGamePlatforms(game.id)}</p>
              <p><strong>Release Date:</strong> {game.releaseDate}</p>
            </div>

            <div className="game-actions">
              {!game.reviewed && (
                <button onClick={() => handleReview(game.id)}>Review</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="add-game-button" onClick={handleAddGame}>
        ➕ Add Game
      </button>
    </div>
  );
}

export default GameListPage;

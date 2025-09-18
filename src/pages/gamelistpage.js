import React, { useState } from 'react';
import './GameListPage.css';
import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useGames } from '../context/GameContext';
import { useUserGames } from '../context/UserGameContext';
import { useGameGenres } from '../context/GameGenreContext';
import { } from '../pages/achievementPage'

function GameListPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [editingStatusId, setEditingStatusId] = useState(null);
  const { games, setGames } = useGames();
  const { gamegenres, setGameGenres } = useGameGenres();
  const [filter, setFilter] = useState('');
  const dropdownRef = useRef(null);


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
    setGames((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: newStatus } : g))
    );
    setEditingStatusId(null); // close dropdown
  };


  const getGameGenres = async (gameId) => {

        const gameGenresList = await Promise.all(
          userGames.map(game => getGameGenres(game.game_id))
        );

    const GenreList = await Promise.all(
      genres.map(genre => getGenres(gameId))
    );
    return "Test";
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
                      onClick={() => updateStatus(game.id, 'not-started')}
                    >
                      ❌ Not Started
                    </div>
                    <div
                      className="dropdown-option"
                      onClick={() => updateStatus(game.id, 'started')}
                    >
                      🕹️ Started
                    </div>
                    <div
                      className="dropdown-option"
                      onClick={() => updateStatus(game.id, 'completed')}
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
              <p><strong>Platform:</strong> {game.platform}</p>
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

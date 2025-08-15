import React, { useState } from 'react';
import './GameListPage.css';
import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useGames } from '../context/GameContext';
import { useUserGames } from '../context/UserGameContext';

function GameListPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [editingStatusId, setEditingStatusId] = useState(null);
  const { games, setGames } = useGames();
  const {usergames, setUserGames} = useUserGames();
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






  const handleAddGame = () => {
   navigate(`/addgamepage`);
  };

  const handleReview = (id) => {
    navigate(`/reviewpage/${id}`);
  };

  const userGameIds = usergames
    .filter(userGame => userGame.user_id === user.id)
    .map(userGame => userGame.game_id);

  const filteredGames = games.filter(
  game =>
    userGameIds.includes(game.id) &&
    game.title.toLowerCase().includes(filter.toLowerCase())
);

   

  
  return (
    <div className="game-list-container">
      <h2>🎮 Game List</h2>

      <input
        type="text"
        placeholder="Filter by title..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="filter-input"
      />

      <div className="game-list">
        {filteredGames.map((game) => (
          <div key={game.id} className="game-item">
            <div className="status-column">
              <div title="Completion Status" className="status-cell">
                {editingStatusId === game.id ? (
                  <div ref={dropdownRef} className="custom-dropdown">
                    <div className="dropdown-selected">
                      {game.status === 'completed'
                        ? '✅ Completed'
                        : game.status === 'started'
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
                    {game.status === 'completed'
                      ? '✅'
                      : game.status === 'started'
                        ? '🕹️'
                        : '❌'}
                  </span>
                )}

              </div>
              <div title="Review Status">
                {game.reviewed ? '📝' : '✏️'}
              </div>
            </div>

            <img src={game.coverImage} alt={game.title} className="cover-image" />

            <div className="game-details">
              <h3>{game.title}</h3>
              <p><strong>Genre:</strong> {game.genre}</p>
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

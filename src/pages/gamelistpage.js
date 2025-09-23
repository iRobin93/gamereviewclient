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
import { usePlatforms } from '../context/PlatformContext'
import { deleteUserGameFromDatabase } from '../api/userGamesApi'
import { putUserGameToDatabase } from '../api/userGamesApi'

function GameListPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [editingStatusId, setEditingStatusId] = useState(null);
  const { games } = useGames();
  const { usergames, setUserGames } = useUserGames();
  const { gamegenres } = useGameGenres();
  const { gameplatforms } = useGamePlatforms();
  const [filter, setFilter] = useState('');
  const dropdownRef = useRef(null);
  const { genres } = useGenres();
  const { platforms } = usePlatforms();


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
  // Optimistically update UI
  setUserGames((userGames) =>
    userGames.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
  );

  // Find the full userGame object to send to backend
  const currentUserGame = usergames.find((u) => u.id === id && u.user_id === user.id);

  if (!currentUserGame) {
    console.error(`UserGame with id ${id} not found.`);
    return;
  }

  // Create updated object for PUT request
  const updatedUserGame = {
    ...currentUserGame,
    status: newStatus,
  };

  // Call API to update in database
  putUserGameToDatabase(id, updatedUserGame)
    .catch((error) => {
      console.error("Failed to update status in database:", error);
      // Optionally revert UI or show a toast/alert
    });

  // Close dropdown
  setEditingStatusId(null);
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

  const handleDeleteUserGame = async (id, title) => {

    const deleted = deleteUserGameFromUserGamesList(id, title);
    if (deleted) {
      deleteUserGameFromDatabase(id);
    }


  };

  const deleteUserGameFromUserGamesList = (id, title) => {
    const userGameToDelete = usergames.find(g => g.id === id);
    if (!userGameToDelete) return false;

    const confirmDelete = window.confirm(`Delete game: ${title}?`);
    if (!confirmDelete) return false;

    setUserGames(prevGames => prevGames.filter(game => game.id !== id));
    return true;
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
        userGame_id: userGame.id,
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
        {filteredUserGames.map((mergedGame_UserGame) => (
          <div key={mergedGame_UserGame.id} className="game-item">
            <div className="status-column">
              <div title="Completion Status" className="status-cell">
                {editingStatusId === mergedGame_UserGame.id ? (
                  <div ref={dropdownRef} className="custom-dropdown">
                    <div className="dropdown-selected">
                      {mergedGame_UserGame.status === 'Finished'
                        ? '✅ Completed'
                        : mergedGame_UserGame.status === 'InProgress'
                          ? '🕹️ Started'
                          : '❌ Not Started'}
                    </div>
                    <div
                      className="dropdown-option"
                      onClick={() => updateStatus(mergedGame_UserGame.userGame_id, 'NotStarted')}
                    >
                      ❌ Not Started
                    </div>
                    <div
                      className="dropdown-option"
                      onClick={() => updateStatus(mergedGame_UserGame.userGame_id, 'InProgress')}
                    >
                      🕹️ Started
                    </div>
                    <div
                      className="dropdown-option"
                      onClick={() => updateStatus(mergedGame_UserGame.userGame_id, 'Finished')}
                    >
                      ✅ Completed
                    </div>
                  </div>
                ) : (
                  <span
                    onClick={() =>
                      setEditingStatusId(editingStatusId === mergedGame_UserGame.id ? null : mergedGame_UserGame.id)
                    }
                    style={{ cursor: 'pointer' }}
                  >
                    {mergedGame_UserGame.status === 'Finished'
                      ? '✅'
                      : mergedGame_UserGame.status === 'InProgress'
                        ? '🕹️'
                        : '❌'}
                  </span>
                )}

              </div>
              <div title="Review Status" onClick={() =>
                handleReview(mergedGame_UserGame.userGame_id)
              }>
                {mergedGame_UserGame.reviewed ? '📝' : '✏️'}
              </div>
            </div>

            <img src={mergedGame_UserGame.coverImageUrl} alt={mergedGame_UserGame.title} className="cover-image" />

            <div className="game-details">
              <h3>{mergedGame_UserGame.title}</h3>
              <p><strong>Genre:</strong> {getGameGenres(mergedGame_UserGame.id)}</p>
              <p><strong>Platform:</strong> {getGamePlatforms(mergedGame_UserGame.id)}</p>
              <p><strong>Release Date:</strong> {mergedGame_UserGame.releaseDate}</p>
            </div>

            <div className="game-actions">
              {!mergedGame_UserGame.reviewed && (
                <button onClick={() => handleReview(mergedGame_UserGame.userGame_id)}>Review</button>
              )}

            </div>
            <div className="game-actions">

              <button onClick={() => handleDeleteUserGame(mergedGame_UserGame.userGame_id, mergedGame_UserGame.title)}>Delete</button>


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

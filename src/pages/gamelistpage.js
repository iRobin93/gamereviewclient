import React, { useState } from 'react';
import './GameListPage.css';
import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useGames } from '../context/GameContext';
import { useUserGames } from '../context/UserGameContext';
import { useGameGenres } from '../context/GameGenreContext';
import { useGamePlatforms } from '../context/GamePlatformContext'
import { fetchGamePlatforms, fetchGameGenres, fetchUserGames } from '../App';
import { useGenres } from '../context/GenreContext';
import { usePlatforms } from '../context/PlatformContext'
import { deleteUserGameFromDatabase } from '../api/userGamesApi'
import { putUserGameToDatabase } from '../api/userGamesApi'
import { fetchGames } from '../App'

function GameListPage() {
  const { user } = useUser();
  const [filterShow, setFilterShow] = useState(false);
  const navigate = useNavigate();
  const [editingStatusId, setEditingStatusId] = useState(null);
  const { games, gamesNeedRefresh, setGamesNeedRefresh, setGames } = useGames();
  const { usergames, setUserGames, setUsergamesNeedRefresh, usergamesNeedRefresh } = useUserGames();
  const { gamegenres, setGameGenres } = useGameGenres();
  const { gameplatforms, gamePlatformsNeedRefresh, setGamePlatformsNeedRefresh, setGamePlatforms } = useGamePlatforms();
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const { genres } = useGenres();
  const { platforms } = usePlatforms();
  const [activePlatforms, setActivePlatforms] = useState([]);
  const [activeGenres, setActiveGenres] = useState([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  
  const [favorites, setFavorites] = useState(() => {
    // Initialize from localStorage if needed
    const saved = localStorage.getItem('favoriteGames');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

useEffect(() => {
  if (!usergamesNeedRefresh) return;
  console.log('usergames refreshed')
  const refreshUserGames = async () => {
    const updatedUserGames = await fetchUserGames(user.id, setUserGames);
    setUserGames(updatedUserGames);
    
    setUsergamesNeedRefresh(false);
  };

  refreshUserGames();
}, [usergamesNeedRefresh, setUsergamesNeedRefresh, setUserGames, user]);


useEffect(() => {
  if (!gamesNeedRefresh) return;
  console.log('games refreshed')
  const refreshUserGames = async () => {
    const updatedGames = await fetchGames(setGames);
    setGames(updatedGames);
    
    setGamesNeedRefresh(false);
  };

  refreshUserGames();
}, [gamesNeedRefresh, setGamesNeedRefresh, setGames, games]);

  useEffect(() => {
    if (!gamePlatformsNeedRefresh) return;
    const refresh = async () => {
      await fetchGamePlatforms(usergames, setGamePlatforms);
      await fetchGameGenres(usergames, setGameGenres)
      setGamePlatformsNeedRefresh(false);
    };

    refresh();
  }, [gamePlatformsNeedRefresh, setGamePlatformsNeedRefresh, usergames, setGamePlatforms, setGameGenres]);


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

  const toggleFilters = () => {
    setFilterShow(!filterShow)
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
      const gameplatform = gameplatforms.find(
        g => g.game_id === game.id && activePlatforms.find(a => a.id === g.platform_id)
      );
      const gamegenre = gamegenres.find(
        g => g.game_id === game.id && activeGenres.find(a => a.id === g.genre_id)
      );
      let showGamePlatform = false;
      if (gameplatform !== undefined) {
        showGamePlatform = true;
      }
      else if (activePlatforms.length === 0)
        showGamePlatform = true;

      let showGameGenre = false;
      if (gamegenre !== undefined) {
        showGameGenre = true;
      }
      else if (activeGenres.length === 0)
        showGameGenre = true;

      return (game && game.title.toLowerCase().includes(search.toLowerCase()) && showGamePlatform && showGameGenre);
    })
    .map(userGame => {
      const game = games.find(g => g.id === userGame.game_id);
      return {
        ...game,
        userGame_id: userGame.id,
        status: userGame.status,
        reviewed: userGame.reviewed,
      };
    });


  const handlePlatformFilter = (platform) => {
    setActivePlatforms(prev => {
      const exists = prev.some(p => p.id === platform.id);

      if (exists) {
        // Remove it
        return prev.filter(p => p.id !== platform.id);
      } else {
        // Add it
        return [...prev, platform];
      }
    });
  };

  const handleGenreFilter = (genre) => {
    setActiveGenres(prev => {
      const exists = prev.some(g => g.id === genre.id);

      if (exists) {
        // Remove it
        return prev.filter(g => g.id !== genre.id);
      } else {
        // Add it
        return [...prev, genre];
      }
    });
  };

  const toggleFavorite = (gameId) => {
    setFavorites(prev => {
      const isFav = prev.includes(gameId);
      const updated = isFav ? prev.filter(id => id !== gameId) : [...prev, gameId];

      // Optional: Save to localStorage
      localStorage.setItem('favoriteGames', JSON.stringify(updated));

      return updated;
    });
  };

  const displayedGames = showOnlyFavorites
    ? filteredUserGames.filter(game => favorites.includes(game.id))
    : filteredUserGames;

  return (
    <div className="game-list-container">
      <h2>🎮 Game List</h2>
      <button onClick={handleAchievement}>Achievements </button>
      <button className={(activePlatforms.length > 0) || (activeGenres.length > 0) ? 'active' : ''} onClick={toggleFilters}>Filter </button>
      <button onClick={() => setShowOnlyFavorites(prev => !prev)}>
        {showOnlyFavorites ? 'Show All Games' : 'Show Favorites Only'}
      </button>

      {filterShow && (
        <div className="filter-section">
          <h3>Filter by Platform</h3>
          <div className="filter-buttons">
            {platforms.map(platform => (
              <button
                key={platform.id}
                className={activePlatforms.some(p => p.id === platform.id) ? 'active' : ''}
                onClick={() => handlePlatformFilter(platform)}
              >
                {platform.platformName}
              </button>
            ))}
          </div>

          <h3>Filter by Genre</h3>
          <div className="filter-buttons">
            {genres.map(genre => (
              <button
                key={genre.id}
                className={activeGenres.some(g => g.id === genre.id) ? 'active' : ''}
                onClick={() => handleGenreFilter(genre)}
              >
                {genre.genreName}
              </button>
            ))}

          </div>
        </div>
      )}

      <input
        type="text"
        placeholder="Filter by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value, activePlatforms, activeGenres)}
        className="filter-input"
      />

      <div className="game-list">
        {displayedGames.map((mergedGame_UserGame) => (
          <div key={mergedGame_UserGame.id} className={`game-item ${favorites.includes(mergedGame_UserGame.id) ? 'favorited' : ''}`}>
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
              <p>
                <strong>Average Review Score:</strong> {mergedGame_UserGame.averageReviewScore?.toFixed(1) ?? "N/A"} / 5
                {" " + "⭐".repeat(Math.round(mergedGame_UserGame.averageReviewScore ?? 0))}
              </p>
            </div>

            <button onClick={() => toggleFavorite(mergedGame_UserGame.id)} className="favorite-button">
              {favorites.includes(mergedGame_UserGame.id) ? '❤️' : '🤍'}
            </button>
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

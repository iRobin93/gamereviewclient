import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGames } from '../context/GameContext';
import { useUserGames } from '../context/UserGameContext';
import { useUser } from '../context/UserContext';
import { useGamePlatforms } from '../context/GamePlatformContext'
import { useGameGenres } from '../context/GameGenreContext'
import { usePlatforms } from '../context/PlatformContext'
import { useGenres } from '../context/GenreContext'
import { postUserGameToDatabase } from '../api/userGamesApi'
import { postGameToDatabase } from '../api/gameApi'
import { postGamePlatformToDatabase } from '../api/gamePlatformApi'
import { postGameGenreToDatabase } from '../api/gameGenresApi'
import axios from 'axios';

function AddGamePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiKey = "b1a02be62e9140459f53df733ff56c1e"; // Secure via env
  const navigate = useNavigate();
  const { user } = useUser();
  const { games, setGames } = useGames();
  const { usergames, setUserGames } = useUserGames();
  const { gameplatforms, setGamePlatforms } = useGamePlatforms();
  const { platforms } = usePlatforms();
  const { genres } = useGenres();
  const { gamegenres, setGameGenres } = useGameGenres();
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);

    try {
      const response = await axios.get('https://api.rawg.io/api/games', {
        params: {
          key: apiKey,
          search: searchTerm
        }
      });

      const data = response.data;
      setResults(data.results || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  }

  const getNewGamePlatformId = () => {
    const existingIds = gameplatforms.map(gameplatform => gameplatform.id);
    let id = 1;
    while (existingIds.includes(id)) {
      id++;
    }
    return id;
  };

  const getNewGameGenreId = () => {
    const existingIds = gamegenres.map(gamegenre => gamegenre.id);
    let id = 1;
    while (existingIds.includes(id)) {
      id++;
    }
    return id;
  };

  const getPlatform_idByRawGId = (rawGId) => {
    const platform = platforms.find(p => p.rawGId === rawGId)
    return platform.id;
  };

  const getGenre_id = (rawGId) => {
    const genre = genres.find(g => g.rawGId === rawGId)
    return genre.id;
  };

  const createGamePlatforms = async (rawGArrayOfPlatforms, gameId) => {
    // Filter and map in one step
    const newPlatforms = rawGArrayOfPlatforms
      .filter(platform => {
        const platformId = getPlatform_idByRawGId(platform.platform.id);
        return !gameplatforms.find(g => g.platform_id === platformId && g.game_id === gameId);
      })
      .map(platform => ({
        game_id: gameId,
        id: getNewGamePlatformId(),
        platform_id: getPlatform_idByRawGId(platform.platform.id),
      }));

    if (newPlatforms.length === 0) return; // No new entries, skip

    setGamePlatforms([...gameplatforms, ...newPlatforms]);

    for (const platform of newPlatforms) {
      await postGamePlatformToDatabase(platform);
    }
  };

  const createUserGame = async (newUserGame) => {

    await postUserGameToDatabase(newUserGame);

    setUserGames([...usergames, newUserGame]);

  }

  const createGame = async (newGame) => {

    await postGameToDatabase(newGame);

    setGames([...games, newGame]);

  }

  const checkIfUserGameExists = (rawGId) => {
    const game = games.find(g => g.rawGId === rawGId)
    if (!game)
      return false;
    const usergame = usergames.find(u => u.game_id === game.id && user.id === u.user_id)
    if (usergame)
      return true;
    return false;
  }


  const createGameGenres = async (rawGArrayOfGenres, gameId) => {
    const newGenres = rawGArrayOfGenres
      .filter(genre => {
        const genreId = getGenre_id(genre.id);
        return !gamegenres.find(g => g.genre_id === genreId && g.game_id === gameId);
      })
      .map(genre => ({
        game_id: gameId,
        id: getNewGameGenreId(),
        genre_id: getGenre_id(genre.id),
      }));

    if (newGenres.length === 0) return; // Skip if there's nothing new

    setGameGenres([...gamegenres, ...newGenres]);
    for (const genre of newGenres) {
      await postGameGenreToDatabase(genre);
    }
  };


  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => navigate('/gamelistpage')}>← Back</button>
      <h2>Add a Game</h2>
      <div>
        <input
          type="text"
          placeholder="Search for a game..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '60%', padding: '0.5rem' }}
        />
        <button onClick={handleSearch} disabled={loading} style={{ marginLeft: '0.5rem' }}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
        {results.map((game) => (
          <li
            key={game.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          >
            <img
              src={game.background_image}
              alt={game.name}
              style={{ width: 60, height: 60, objectFit: 'cover', marginRight: '1rem' }}
            />
            <div style={{ flexGrow: 1 }}>
              <strong>{game.name}</strong>
              <div>{game.released}</div>
            </div>
            <button
              onClick={async () => {
                const checkGameExist = checkIfUserGameExists(game.id);
                if (checkGameExist) {
                  window.alert(`Game ${game.name} already exists in your list`);
                  return;
                }

                const newGame = {
                  title: game.name,
                  coverImageUrl: game.background_image,
                  releaseDate: game.released,
                  rawGId: game.id,
                };
                await createGame(newGame);
                setGames([...games, newGame]);
                const newUserGame = {
                  rating: undefined,
                  reviewed: false,
                  reviewText: "",
                  status: "NotStarted",
                  game_id: newGame.id,
                  user_id: user.id
                }
                createUserGame(newUserGame);
                createGamePlatforms(game.platforms, newUserGame.game_id);
                createGameGenres(game.genres, newUserGame.game_id)
                navigate('/gamelistpage'); // 👈 Navigate after adding
              }}
            >
              Add
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AddGamePage;

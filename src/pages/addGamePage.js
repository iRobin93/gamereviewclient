import { useState } from 'react';
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
import { postOneRawGPlatformsToDatabase } from '../api/platformApi'
import axios from 'axios';

function AddGamePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [moreGamesToDisplay, setMoreGamesDisplay] = useState(false);

  const [loading, setLoading] = useState(false);
  const apiKey = "b1a02be62e9140459f53df733ff56c1e"; // Secure via env
  const navigate = useNavigate();
  const { user } = useUser();
  const { games, setGames } = useGames();
  const [results, setResults] = useState([]);
  const { usergames, setUserGames } = useUserGames();
  const { gameplatforms, setGamePlatforms } = useGamePlatforms();
  const { platforms, setPlatforms } = usePlatforms();
  const { genres } = useGenres();
  const { gamegenres, setGameGenres } = useGameGenres();
  const [activeSearch, setActiveSearch] = useState('rawG')

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);

    if (activeSearch === 'rawG') {

      try {
        const response = await axios.get('https://api.rawg.io/api/games', {
          params: {
            key: apiKey,
            search: searchTerm,
            page_size: 40
          }
        });

        const data = response.data;
        setResults(data.results || []);
        if (data.next != null)
          setMoreGamesDisplay(true);
        else
          setMoreGamesDisplay(false);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }
    else {
      try {
        const filteredGames = games
          .filter(Game => {
            return (Game.title.toLowerCase().includes(searchTerm.toLowerCase()));
          })

          setResults(filteredGames);
      } catch (err) {
        console.error('Search failed:', err);
      }
      finally {
        setLoading(false);
      }

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
    if (platform)
      return platform.id;
    return undefined;
  };

  const getGenre_id = (rawGId) => {
    const genre = genres.find(g => g.rawGId === rawGId)
    return genre.id;
  };



  const createGamePlatforms = async (rawGArrayOfPlatforms, gameId) => {
    const newGamePlatforms = [];

    for (const entry of rawGArrayOfPlatforms) {

      const rawPlatformId = entry.platform.id;
      const rawPlatformName = entry.platform.name;

      // STEP 2: Try to map to internal platform_id
      let platformId = getPlatform_idByRawGId(rawPlatformId);

      // STEP 2b: If not found, create and store a new platform
      if (!platformId) {
        const newPlatform = {
          rawGId: rawPlatformId,
          platformName: rawPlatformName,
        };

        try {
          // Post to backend and get assigned id if needed
          const savedPlatform = await postOneRawGPlatformsToDatabase(newPlatform);
          platformId = savedPlatform.id; // Adjust depending on your backend response
          setPlatforms((prev) => [...prev, savedPlatform]);
          console.log(`➕ Created new platform: ${rawPlatformName} (id: ${platformId})`);
        } catch (err) {
          console.error("❌ Failed to post new platform:", newPlatform, err);
          continue; // Skip this platform if creation failed
        }
      }

      // STEP 3: Check for duplicates
      const alreadyExists = gameplatforms.some(
        (g) => g.platform_id === platformId && g.game_id === gameId
      );

      if (alreadyExists) {
        console.log(`ℹ️ Platform already exists for game ${gameId}:`, platformId);
        continue;
      }

      // STEP 4: Add to new platforms list
      newGamePlatforms.push({
        game_id: gameId,
        id: getNewGamePlatformId(),
        platform_id: platformId,
      });
    }

    // No new platforms to add
    if (newGamePlatforms.length === 0) {
      console.log("✅ No new platforms to add.");
      return;
    }

    // Optimistically update UI using functional state update
    setGamePlatforms((prev) => [...prev, ...newGamePlatforms]);

    // Send new platforms to backend
    for (const platform of newGamePlatforms) {
      try {
        await postGamePlatformToDatabase(platform);
      } catch (err) {
        console.error("❌ Failed to post platform:", platform, err);
      }
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

  const checkIfUserGameExistsByRawGId = (rawGId) => {
    const game = games.find(g => g.rawGId === rawGId)
    if (!game)
      return false;
    const usergame = usergames.find(u => u.game_id === game.id && user.id === u.user_id)
    if (usergame)
      return true;
    return false;
  }

  const checkIfUserGameExistsByGameReviewId = (gameReviewId) => {
    const game = games.find(g => g.id === gameReviewId)
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

  if (activeSearch === "rawG")
    return (
      <div style={{ padding: '2rem' }}>
        <button onClick={() => navigate('/gamelistpage')}>← Back</button>
        <h2>Add a Game</h2>

        {moreGamesToDisplay && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0f8ff', borderLeft: '4px solid #ff0000ff', borderRadius: '4px' }}>
            <strong style={{ color: '#ff0000ff', fontSize: '1.1rem' }}>
              More games found. Search more narrow for a better suiting list.
            </strong>
          </div>
        )}<button
          className={activeSearch === 'rawG' ? 'active' : 'inactive'}
          onClick={() => setActiveSearch('rawG')}>
          RawG Games
        </button>

        <button
          className={activeSearch === 'gameReview' ? 'active' : 'inactive'}
          onClick={() => {
            setActiveSearch('gameReview');
            setResults(games);
            setSearchTerm('');
          }}>
          GameReview Games
        </button>

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
                  const checkGameExist = checkIfUserGameExistsByRawGId(game.id);
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
                  await createUserGame(newUserGame);
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

  else {



    return (
      <div style={{ padding: '2rem' }}>
        <button onClick={() => navigate('/gamelistpage')}>← Back</button>
        <h2>Add a Game</h2>

        {moreGamesToDisplay && (
          <div style={{ marginTop: '1.5rem', marginBottom: '1rem', padding: '1rem', backgroundColor: '#f0f8ff', borderLeft: '4px solid #ff0000ff', borderRadius: '4px' }}>
            <strong style={{ color: '#ff0000ff', fontSize: '1.1rem' }}>
              More games found. Search more narrow for a better suiting list.
            </strong>
          </div>
        )}<button
          className={activeSearch === 'rawG' ? 'active' : 'inactive'}
          onClick={() => {
            setActiveSearch('rawG');
            setResults([]);
            setSearchTerm('');
          }}>
          RawG Games
        </button>

        <button
          className={activeSearch === 'gameReview' ? 'active' : 'inactive'}
          onClick={() => setActiveSearch('gameReview')}>
          GameReview Games
        </button>

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
                src={game.coverImageUrl}
                alt={game.title}
                style={{ width: 60, height: 60, objectFit: 'cover', marginRight: '1rem' }}
              />
              <div style={{ flexGrow: 1 }}>
                <strong>{game.title}</strong>
                <div>{game.releaseDate}</div>
              </div>
              <button
                onClick={async () => {
                  const checkGameExist = checkIfUserGameExistsByGameReviewId(game.id);
                  if (checkGameExist) {
                    window.alert(`Game ${game.title} already exists in your list`);
                    return;
                  }
                  const newUserGame = {
                    rating: undefined,
                    reviewed: false,
                    reviewText: "",
                    status: "NotStarted",
                    game_id: game.id,
                    user_id: user.id
                  }
                  await createUserGame(newUserGame);
                  navigate('/gamelistpage'); // 👈 Navigate after adding
                }}
              >
                Add
              </button>
            </li>
          ))}
        </ul>
      </div>
    )

  }

}

export default AddGamePage;

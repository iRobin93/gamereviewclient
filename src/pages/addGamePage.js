import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGames } from '../context/GameContext';
import { useUserGames } from '../context/UserGameContext';
import { useUser } from '../context/UserContext';
import { useGamePlatforms } from '../context/GamePlatformContext';
import { useGameGenres } from '../context/GameGenreContext';
import { usePlatforms } from '../context/PlatformContext';
import { useGenres } from '../context/GenreContext';
import { postUserGameToDatabase } from '../api/userGamesApi';
import { postGameToDatabase } from '../api/gameApi';
import { postGamePlatformToDatabase } from '../api/gamePlatformApi';
import { postGameGenreToDatabase } from '../api/gameGenresApi';
import { postOneRawGPlatformsToDatabase } from '../api/platformApi';
import { BASE_URL } from '../model/generalData';
import "../css/addgamepage.css"
import axios from 'axios';

function AddGamePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [moreGamesToDisplay, setMoreGamesDisplay] = useState(false);
  const [addGamePressed, setAddGamePressed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [activeSearch, setActiveSearch] = useState('rawG');
  const [activeSort, setActiveSort] = useState('');

  const navigate = useNavigate();
  const { user } = useUser();
  const { games, setGames } = useGames();
  const { usergames, setUserGames } = useUserGames();
  const { gameplatforms, setGamePlatforms, setGamePlatformsNeedRefresh } = useGamePlatforms();
  const { platforms, setPlatforms } = usePlatforms();
  const { genres } = useGenres();
  const { gamegenres, setGameGenres } = useGameGenres();

  const apiKey = "b1a02be62e9140459f53df733ff56c1e"; // Ideally from .env

  const sortingOptions = [
    { title: 'Reviewed Count', key: 'reviewedCount' },
    { title: 'People Has Game', key: 'userGameCount' },
    { title: 'Average Review Score', key: 'averageReviewScore' },
  ];

  // ✅ Helper: Create new game
  const createGame = async (newGame) => {
    const savedGame = await postGameToDatabase(newGame);
    setGames([...games, savedGame]);
    return savedGame;
  };

  // ✅ NEW: Unified check (works for both RawG and GameReview games)
  const checkIfUserGameExists = (game) => {
    if (!game || !games?.length || !usergames?.length || !user?.id) return false;

    // Try matching by rawGId first, fallback to internal id
    const existingGame = games.find((g) =>
      game.rawGId
        ? g.rawGId === game.rawGId
        : g.id === game.id
    );

    if (!existingGame) return false;

    // Check if the current user already has a link to this game
    return usergames.some(
      (u) => u.game_id === existingGame.id && u.user_id === user.id
    );
  };


  // ✅ Create new GameGenres
  const getNewGameGenreId = () => {
    const ids = gamegenres.map((g) => g.id);
    let id = 1;
    while (ids.includes(id)) id++;
    return id;
  };

  const getGenre_id = (rawGId) =>
    genres.find((g) => g.rawGId === rawGId)?.id;

  const createGameGenres = async (rawGArrayOfGenres, gameId) => {
    const newGenres = rawGArrayOfGenres
      .filter((genre) => {
        const genreId = getGenre_id(genre.id);
        return !gamegenres.find((g) => g.genre_id === genreId && g.game_id === gameId);
      })
      .map((genre) => ({
        game_id: gameId,
        id: getNewGameGenreId(),
        genre_id: getGenre_id(genre.id),
      }));

    if (newGenres.length === 0) return;

    setGameGenres((prev) => [...prev, ...newGenres]);
    for (const genre of newGenres) await postGameGenreToDatabase(genre);
  };

  // ✅ Create new GamePlatforms
  const getNewGamePlatformId = () => {
    const ids = gameplatforms.map((g) => g.id);
    let id = 1;
    while (ids.includes(id)) id++;
    return id;
  };

  const getPlatform_idByRawGId = (rawGId) =>
    platforms.find((p) => p.rawGId === rawGId)?.id;

  const createGamePlatforms = async (rawGArrayOfPlatforms, gameId) => {
    const newGamePlatforms = [];

    for (const entry of rawGArrayOfPlatforms) {
      const rawPlatformId = entry.platform.id;
      const rawPlatformName = entry.platform.name;
      let platformId = getPlatform_idByRawGId(rawPlatformId);

      if (!platformId) {
        const newPlatform = { rawGId: rawPlatformId, platformName: rawPlatformName };
        try {
          const savedPlatform = await postOneRawGPlatformsToDatabase(newPlatform);
          platformId = savedPlatform.id;
          setPlatforms((prev) => [...prev, savedPlatform]);
        } catch (err) {
          console.error("❌ Failed to create platform:", err);
          continue;
        }
      }

      const alreadyExists = gameplatforms.some(
        (g) => g.platform_id === platformId && g.game_id === gameId
      );
      if (alreadyExists) continue;

      newGamePlatforms.push({
        game_id: gameId,
        id: getNewGamePlatformId(),
        platform_id: platformId,
      });
    }

    if (newGamePlatforms.length === 0) return;

    setGamePlatforms((prev) => [...prev, ...newGamePlatforms]);
    for (const gp of newGamePlatforms) await postGamePlatformToDatabase(gp);
  };

  // 🔍 Search Handler
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);

    console.log("🔍 Active search mode:", activeSearch);

    if (activeSearch === 'rawG') {
      try {
        const response = await axios.get('https://api.rawg.io/api/games', {
          params: { key: apiKey, search: searchTerm, page_size: 40 },
        });
        const data = response.data;
        console.log("🧩 RAWG results count:", data.results?.length);

        const filtered = data.results.filter((game) => {
          if (!game.tags) return true;
          const tags = game.tags.map((t) => t.slug.toLowerCase());
          const blocked = [
            'nsfw', 'adult', 'sexual-content', 'nudity',
            'hentai', 'erotic', 'mature', 'porn', 'sex',
            '18-plus', 'explicit'
          ];
          return !tags.some((t) => blocked.includes(t));
        });

        console.log("✅ Filtered RAWG games:", filtered.length);
        setResults(filtered || []);
        setMoreGamesDisplay(!!data.next);
      } catch (err) {
        console.error('❌ Search failed (RAWG):', err);
      } finally {
        setLoading(false);
      }
    } else {
      console.log("📘 Searching GameReview games from local DB...");
      console.log("Current games count:", games.length);
      const filtered = games.filter((g) =>
        g.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log("🎮 GameReview filtered count:", filtered.length);
      if (filtered.length > 0) {
        console.log("🎮 Sample GameReview game:", filtered[0]);
      } else {
        console.warn("⚠️ No matching GameReview games found.");
      }
      setResults(filtered);
      setLoading(false);
    }
  };

  const normalizeReleaseDate = (date) => {
    if (!date) return null;
    if (Array.isArray(date)) {
      const [year, month, day] = date;
      return new Date(year, month - 1, day).toISOString().split("T")[0];
    }
    return typeof date === "string" ? date : null;
  };


  // 🔽 Sort handler
  const handleSort = (sorting) => {
    setActiveSort(sorting.title);
    const key = sorting.key;
    const sorted = [...results].sort((a, b) => {
      if (typeof a[key] === 'number' && typeof b[key] === 'number') return b[key] - a[key];
      if (typeof a[key] === 'string' && typeof b[key] === 'string') return b[key].localeCompare(a[key]);
      return 0;
    });
    setResults(sorted);
  };

  // ✅ UI for RAWG Games
  if (activeSearch === 'rawG') {
    return (
      <div style={{ padding: '2rem' }}>
        {addGamePressed && (
          <div className="loading-overlay">
            <p>Adding game, please wait...</p>
          </div>
        )}

        <button className="button" onClick={() => navigate('/gamelistpage')}>← Back</button>
        <h2>Add a Game</h2>

        {moreGamesToDisplay && (
          <div className="warning-box">
            <strong>More games found. Search more narrowly for better results.</strong>
          </div>
        )}

        <button
          className={activeSearch === 'rawG' ? 'active' : ''}
          onClick={() => setActiveSearch('rawG')}
        >RawG Games</button>

        <button
          className={activeSearch === 'gameReview' ? 'active' : ''}
          onClick={() => {
            setActiveSearch('gameReview');
            setResults(games);
            setSearchTerm('');
          }}
        >GameReview Games</button>

        <div style={{ marginTop: '1rem' }}>
          <input
            type="text"
            placeholder="Search for a game..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '60%', padding: '0.5rem' }}
          />
          <button className="button" onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
          {results.map((game) => (
            <li key={game.id} className="game-result-item">
              <img src={game.background_image} alt={game.name} className="game-thumb" />
              <div className="game-info">
                <strong>{game.name}</strong>
                <div>
                  {game.released
                    ? new Date(game.released).toLocaleDateString("no-NO")
                    : "Not available"}
                </div>
              </div>
              <button
                className="button"
                onClick={async () => {
                  if (checkIfUserGameExists(game)) {
                    window.alert(`Game ${game.name || game.title} already exists in your list`);
                    return;
                  }

                  setAddGamePressed(true);

                  try {
                    // 🧩 Step 1: Find or create the base game
                    let gameObject = games.find(
                      (g) => g.rawGId === game.rawGId || g.id === game.id
                    );

                    const createGenreAndPlatforms = !gameObject;

                    if (!gameObject) {
                      const newGame = {
                        title: game.name || game.title,
                        coverImageUrl: game.background_image || game.coverImageUrl,
                        releaseDate: normalizeReleaseDate(game.released || game.releaseDate),
                        rawGId: game.rawGId || (activeSearch === "rawG" ? game.id : null),
                      };

                      gameObject = await createGame(newGame);
                    }

                    // 🧩 Step 2: Create the user-game link
                    const newUserGame = {
                      rating: undefined,
                      reviewed: false,
                      reviewText: "",
                      status: "NotStarted",
                      game_id: gameObject.id,
                      user_id: user.id,
                    };
                    await postUserGameToDatabase(newUserGame);

                    // 🧩 Step 3: Create game genres & platforms if needed
                    if (createGenreAndPlatforms && game.platforms && game.genres) {
                      await createGamePlatforms(game.platforms, gameObject.id);
                      await createGameGenres(game.genres, gameObject.id);
                      setGamePlatformsNeedRefresh(true);
                    }

                    // 🧩 Step 4: Refetch everything so new data shows immediately
                    const [updatedGamesResponse, updatedUserGamesResponse, gpResponse, ggResponse] =
                      await Promise.all([
                        axios.get(`${BASE_URL}/Game`),
                        axios.get(`${BASE_URL}/UserGame`),
                        axios.get(`${BASE_URL}/GamePlatform`),
                        axios.get(`${BASE_URL}/GameGenre`),
                      ]);

                    setGames(updatedGamesResponse.data);
                    setUserGames(updatedUserGamesResponse.data);
                    setGamePlatforms(gpResponse.data);
                    setGameGenres(ggResponse.data);

                    // ✅ Navigate to gamelist (with updated data)
                    navigate("/gamelistpage");
                  } catch (err) {
                    console.error("❌ Failed to add game:", err);
                    window.alert("Failed to add game. Please try again.");
                  } finally {
                    setAddGamePressed(false);
                  }
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

  // ✅ UI for GameReview Games
  return (
    <div style={{ padding: '2rem' }}>
      <button className="button" onClick={() => navigate('/gamelistpage')}>← Back</button>
      <h2>Add a Game</h2>

      <button
        className={activeSearch === 'rawG' ? 'active' : ''}
        onClick={() => {
          setActiveSearch('rawG');
          setResults([]);
          setSearchTerm('');
        }}
      >RawG Games</button>

      <button
        className={activeSearch === 'gameReview' ? 'active' : ''}
        onClick={() => setActiveSearch('gameReview')}
      >GameReview Games</button>

      <div className="sort-buttons">
        {sortingOptions.map((sorting) => (
          <button
            key={sorting.title}
            className={activeSort === sorting.title ? 'active' : ''}
            onClick={() => handleSort(sorting)}
          >
            {sorting.title}
          </button>
        ))}
      </div>

      <div>
        <input
          type="text"
          placeholder="Search for a game..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '60%', padding: '0.5rem' }}
        />
        <button className="button" onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
        {results.map((game) => (
          <li key={game.id} className="game-result-item">
            <img src={game.coverImageUrl} alt={game.title} className="game-thumb" />
            <div className="game-info">
              <strong>{game.title}</strong>
              <div>
                Release Date:{" "}
                {game.releaseDate
                  ? new Date(game.releaseDate).toLocaleDateString("no-NO")
                  : "Not available"}
              </div>
              <div>#Users: {game.userGameCount}</div>
              <div>#Reviews: {game.reviewedCount}</div>
              <div>
                Review Score:{" "}
                {game.averageReviewScore
                  ? `${game.averageReviewScore.toFixed(1)} / 5.0`
                  : "Not reviewed"}
              </div>
            </div>

            <div className="game-actions">
              <button
                className="button"
                onClick={async () => {
                  if (checkIfUserGameExists(game)) {
                    window.alert(`Game ${game.name || game.title} already exists in your list`);
                    return;
                  }

                  setAddGamePressed(true);

                  try {
                    // 🧩 Step 1: Find or create the base game
                    let gameObject = games.find(
                      (g) => g.rawGId === game.rawGId || g.id === game.id
                    );

                    const createGenreAndPlatforms = !gameObject;

                    if (!gameObject) {
                      const newGame = {
                        title: game.name || game.title,
                        coverImageUrl: game.background_image || game.coverImageUrl,
                        releaseDate: normalizeReleaseDate(game.released || game.releaseDate),
                        rawGId: game.rawGId || (activeSearch === "rawG" ? game.id : null),
                      };

                      gameObject = await createGame(newGame);
                    }

                    // 🧩 Step 2: Create the user-game link
                    const newUserGame = {
                      rating: undefined,
                      reviewed: false,
                      reviewText: "",
                      status: "NotStarted",
                      game_id: gameObject.id,
                      user_id: user.id,
                    };
                    await postUserGameToDatabase(newUserGame);

                    // 🧩 Step 3: Create game genres & platforms if needed
                    if (createGenreAndPlatforms && game.platforms && game.genres) {
                      await createGamePlatforms(game.platforms, gameObject.id);
                      await createGameGenres(game.genres, gameObject.id);
                      setGamePlatformsNeedRefresh(true);
                    }

                    // 🧩 Step 4: Refetch everything so new data shows immediately
                    const [updatedGamesResponse, updatedUserGamesResponse, gpResponse, ggResponse] =
                      await Promise.all([
                        axios.get(`${BASE_URL}/Game`),
                        axios.get(`${BASE_URL}/UserGame`),
                        axios.get(`${BASE_URL}/GamePlatform`),
                        axios.get(`${BASE_URL}/GameGenre`),
                      ]);

                    setGames(updatedGamesResponse.data);
                    setUserGames(updatedUserGamesResponse.data);
                    setGamePlatforms(gpResponse.data);
                    setGameGenres(ggResponse.data);

                    // ✅ Navigate to gamelist (with updated data)
                    navigate("/gamelistpage");
                  } catch (err) {
                    console.error("❌ Failed to add game:", err);
                    window.alert("Failed to add game. Please try again.");
                  } finally {
                    setAddGamePressed(false);
                  }
                }}
              >
                Add
              </button>

              <button
                className="button"
                onClick={() =>
                  navigate(`/reviews/${game.id}`, {
                    state: { game, fromGameReview: true },
                  })
                }
              >
                View Reviews
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AddGamePage;

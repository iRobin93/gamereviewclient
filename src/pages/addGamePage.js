import { useEffect, useState } from 'react';
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
import { getGamePlatforms, postGamePlatformToDatabase } from '../api/gamePlatformApi';
import { getGameGenres, postGameGenreToDatabase } from '../api/gameGenresApi';
import "../css/addgamepage.css"
import axios from 'axios';

function AddGamePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [moreGamesToDisplay, setMoreGamesDisplay] = useState(false);
  const [addGamePressed, setAddGamePressed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [activeSearch, setActiveSearch] = useState('gameReview');
  const [activeSort, setActiveSort] = useState('');

  const navigate = useNavigate();
  const { user } = useUser();
  const { games, setGames } = useGames();
  const { usergames, setUserGames } = useUserGames();
  const { gameplatforms, setGamePlatforms } = useGamePlatforms();
  const { platforms } = usePlatforms();
  const { genres } = useGenres();
  const { gamegenres, setGameGenres } = useGameGenres();

  const apiKey = "b1a02be62e9140459f53df733ff56c1e"; // Ideally from .env

  const sortingOptions = [
    { title: 'Sort by #Reviews', key: 'reviewedCount' },
    { title: 'Sort by #Users', key: 'userGameCount' },
    { title: 'Sort by Score', key: 'averageReviewScore' },
  ];


  useEffect(() => {
    setActiveSearch("gameReview");
    setResults(games);
    setSearchTerm("");
  }, [games]);


  // ✅ Helper: Create new game
  const createGame = async (newGame) => {
    const savedGame = await postGameToDatabase(newGame);
    setGames([...games, savedGame]);
    return savedGame;
  };



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



  const checkIfUserGameExistsFromRawG = (rawGgame) => {
    if (!rawGgame || !games?.length || !usergames?.length || !user?.id) return false;

    // Try matching by rawGId first, fallback to internal id
    const existingGame = games.find((g) =>
      g.rawGId === rawGgame.id

    );

    if (!existingGame) return false;

    // Check if the current user already has a link to this game
    return usergames.some(
      (u) => u.game_id === existingGame.id && u.user_id === user.id
    );
  };

  const createGameGenres = async (genreArray, gameId) => {
    const newGameGenres = [];

    for (const entry of genreArray) {
      let rawGenreId = null;
      let rawGenreName = null;

      if (entry?.id && entry?.name) {
        rawGenreId = entry.id;
        rawGenreName = entry.name;
      } else if (typeof entry === "string") {
        rawGenreName = entry;
      } else if (entry?.genreName) {
        rawGenreId = entry.rawGId || null;
        rawGenreName = entry.genreName;
      } else {
        console.warn("⚠️ Unknown genre format:", entry);
        continue;
      }

      let genreId =
        genres.find((g) => g.rawGId === rawGenreId)?.id ||
        genres.find((g) => g.genreName.toLowerCase() === rawGenreName?.toLowerCase())?.id;

      if (!genreId) continue;

      const alreadyExists = gamegenres.some(
        (gg) => gg.genre_id === genreId && gg.game_id === gameId
      );
      if (alreadyExists) continue;

      newGameGenres.push({
        game_id: gameId,
        genre_id: genreId,
      });
    }

    if (newGameGenres.length === 0) return;

    for (const gg of newGameGenres) {
      try {
        const savedGG = await postGameGenreToDatabase(gg);
        // Update local state with the returned ID from backend
        setGameGenres((prev) => [...prev, savedGG]);
      } catch (err) {
        console.error("❌ Failed to create GameGenre:", err);
      }
    }
  };

  const createGamePlatforms = async (rawGArrayOfPlatforms, gameId) => {
    const newGamePlatforms = [];

    for (const entry of rawGArrayOfPlatforms) {
      let rawPlatformId = null;
      let rawPlatformName = null;

      if (entry?.platform?.id && entry?.platform?.name) {
        rawPlatformId = entry.platform.id;
        rawPlatformName = entry.platform.name;
      } else if (entry?.rawGId && entry?.platformName) {
        rawPlatformId = entry.rawGId;
        rawPlatformName = entry.platformName;
      } else if (typeof entry === "string") {
        rawPlatformName = entry;
      } else {
        console.warn("⚠️ Unknown platform format:", entry);
        continue;
      }

      let platform = platforms.find(
        (p) =>
          (rawPlatformId && p.rawGId === rawPlatformId) ||
          (rawPlatformName &&
            p.platformName.toLowerCase() === rawPlatformName.toLowerCase())
      );

      if (!platform) {
        alert(`Platform "${rawPlatformName}" not found in local DB`);
      }

      const alreadyExists = gameplatforms.some(
        (gp) => gp.platform_id === platform.id && gp.game_id === gameId
      );
      if (alreadyExists) continue;

      newGamePlatforms.push({
        game_id: gameId,
        platform_id: platform.id,
      });
    }

    if (newGamePlatforms.length === 0) return;

    for (const gp of newGamePlatforms) {
      try {
        const savedGP = await postGamePlatformToDatabase(gp);
        // Update local state with the returned ID from backend
        setGamePlatforms((prev) => [...prev, savedGP]);
      } catch (err) {
        console.error("❌ Failed to create GamePlatform:", err);
      }
    }
  };

  // 🔍 Search Handler
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      console.log("🔁 Empty search — showing all games");
      if (activeSearch === "gameReview") {
        setResults(games); // show all local games
      } else {
        // optional: clear RAWG results if search is empty
        setResults([]);
      }
      setLoading(false);
      return;
    }
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
  // ✅ UI for RAWG Games
  // ✅ UI for RawG Games
  if (activeSearch === "rawG") {
    return (
      <div className="page-wrapper-addgame">
        <div className="add-game-container-addgame">
          <div className="add-game-content-addgame">
            {addGamePressed && (
              <div className="loading-overlay-addgame">
                <p>Adding game, please wait...</p>
              </div>
            )}

            <button
              className="button-addgame back-btn-addgame"
              onClick={() => navigate("/gamelistpage")}
            >
              ← Back
            </button>

            <h2 className="title-addgame">Add a Game</h2>

            {moreGamesToDisplay && (
              <div className="warning-box-addgame">
                <strong>
                  More games found. Search more narrowly for better results.
                </strong>
              </div>
            )}

            <div className="search-toggle-addgame">
              <button
                className={`toggle-btn-addgame ${activeSearch === "rawG" ? "active" : ""
                  }`}
                onClick={() => setActiveSearch("rawG")}
              >
                RawG Games
              </button>
              <button
                className={`toggle-btn-addgame ${activeSearch === "gameReview" ? "active" : ""
                  }`}
                onClick={() => {
                  setActiveSearch("gameReview");
                  setResults(games);
                  setSearchTerm("");
                }}
              >
                GameReview Games
              </button>
            </div>

            <div className="search-bar-addgame">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
              >
                <input
                  type="text"
                  placeholder="Search for a game..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button
                  type="submit"
                  className="button-addgame"
                  disabled={loading}
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </form>
            </div>

            {/* === CARD GRID FOR RAWG GAMES === */}
            <div className="game-card-grid-addgame">
              {results.map((rawGGame) => (
                <div key={rawGGame.id} className="game-card-addgame">
                  <img
                    src={rawGGame.background_image}
                    alt={rawGGame.name}
                    className="game-thumb-addgame"
                  />
                  <div className="game-info-addgame">
                    <h3 className="game-title-addgame">{rawGGame.name}</h3>
                    <p className="release-date-addgame">
                      {rawGGame.released
                        ? new Date(rawGGame.released).toLocaleDateString("no-NO")
                        : "Not available"}
                    </p>
                  </div>

                  <div className="card-buttons-addgame">
                    <button
                      className="button-addgame"
                      onClick={async () => {
                        if (checkIfUserGameExistsFromRawG(rawGGame)) {
                          window.alert(
                            `Game ${rawGGame.name || rawGGame.title} already exists in your list`
                          );
                          return;
                        }
                        setAddGamePressed(true);
                        try {
                          let gameObject = games.find(
                            (g) => g.rawGId === rawGGame.id
                          );
                          const createGenreAndPlatforms = !gameObject;
                          if (!gameObject) {
                            const newGame = {
                              title: rawGGame.name || rawGGame.title,
                              coverImageUrl:
                                rawGGame.background_image ||
                                rawGGame.coverImageUrl,
                              releaseDate: normalizeReleaseDate(
                                rawGGame.released || rawGGame.releaseDate
                              ),
                              rawGId:
                                rawGGame.rawGId ||
                                (activeSearch === "rawG" ? rawGGame.id : null),
                            };
                            gameObject = await createGame(newGame);
                          }

                          const newUserGame = {
                            rating: undefined,
                            reviewed: false,
                            reviewText: "",
                            status: "NotStarted",
                            game_id: gameObject.id,
                            user_id: user.id,
                          };
                          await postUserGameToDatabase(newUserGame);
                          setUserGames([...usergames, newUserGame]);
                          setGames(prev => prev.map(g => g.id === gameObject.id ? { ...g, userGameCount: g.userGameCount + 1 } : g));
                          if (createGenreAndPlatforms) {
                            if (rawGGame.platforms) {
                              await createGamePlatforms(
                                rawGGame.platforms,
                                gameObject.id
                              );
                            }
                            if (rawGGame.genres) {
                              await createGameGenres(
                                rawGGame.genres,
                                gameObject.id
                              );
                            }
                          } else {
                            const newGameGenres = await getGameGenres(
                              newUserGame.game_id
                            );
                            const newGamePlatforms = await getGamePlatforms(
                              newUserGame.game_id
                            );
                            setGamePlatforms((prev) => [
                              ...prev,
                              ...newGamePlatforms,
                            ]);
                            setGameGenres((prev) => [
                              ...prev,
                              ...newGameGenres,
                            ]);
                          }

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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ SAME ORDER + STRUCTURE for GameReview games
  return (
    <div className="page-wrapper-addgame">
      <div className="add-game-container-addgame">
        <div className="add-game-content-addgame">
          {addGamePressed && (
            <div className="loading-overlay-addgame">
              <p>Adding game, please wait...</p>
            </div>
          )}

          <button
            className="button-addgame back-btn-addgame"
            onClick={() => navigate("/gamelistpage")}
          >
            ← Back
          </button>

          <h2 className="title-addgame">Add a Game</h2>

          <div className="search-toggle-addgame">
            <button
              className={`toggle-btn-addgame ${activeSearch === "rawG" ? "active" : ""
                }`}
              onClick={() => {
                setActiveSearch("rawG");
                setResults([]);
                setSearchTerm("");
              }}
            >
              RawG Games
            </button>
            <button
              className={`toggle-btn-addgame ${activeSearch === "gameReview" ? "active" : ""
                }`}
              onClick={() => setActiveSearch("gameReview")}
            >
              GameReview Games
            </button>
          </div>

          <div className="sort-buttons-addgame">
            {sortingOptions.map((sorting) => (
              <button
                key={sorting.title}
                className={`toggle-btn-addgame ${activeSort === sorting.title ? "active" : ""
                  }`}
                onClick={() => handleSort(sorting)}
              >
                {sorting.title}
              </button>
            ))}
          </div>

          <div className="search-bar-addgame">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
            >
              <input
                type="text"
                placeholder="Search for a game..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="button-addgame"
                disabled={loading}
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </form>
          </div>

          {/* === CARD GRID FOR GAMEREVIEW GAMES === */}
          <div className="game-card-grid-addgame">
            {results.map((game) => (
              <div key={game.id} className="game-card-addgame">
                <img
                  src={game.coverImageUrl}
                  alt={game.title}
                  className="game-thumb-addgame"
                />
                <div className="game-info-addgame">
                  <h3 className="game-title-addgame">{game.title}</h3>
                  <p className="release-date-addgame">
                    {game.releaseDate
                      ? new Date(game.releaseDate).toLocaleDateString("no-NO")
                      : "Not available"}
                  </p>
                  <p className="meta-addgame">#Users: {game.userGameCount}</p>
                  <p className="meta-addgame">#Reviews: {game.reviewedCount}</p>
                  <p className="meta-addgame">
                    Avg Score:{" "}
                    {game.averageReviewScore?.toFixed(1) ?? "0"} / 5.0{" "}
                    {Array.from({ length: 5 }, (_, i) => (
                      <span key={i} className="star">
                        {i <
                          Math.round(game.averageReviewScore ?? 0)
                          ? "★"
                          : "☆"}
                      </span>
                    ))}
                  </p>
                </div>

                <div className="card-buttons-addgame">
                  <button
                    className="button-addgame"
                    onClick={async () => {
                      if (checkIfUserGameExists(game)) {
                        window.alert(
                          `Game ${game.name || game.title} already exists in your list`
                        );
                        return;
                      }
                      setAddGamePressed(true);
                      try {
                        const newUserGame = {
                          rating: undefined,
                          reviewed: false,
                          reviewText: "",
                          status: "NotStarted",
                          game_id: game.id,
                          user_id: user.id,
                        };
                        await postUserGameToDatabase(newUserGame);
                        setUserGames([...usergames, newUserGame]);
                        setGames(prev => prev.map(g => g.id === game.id ? { ...g, userGameCount: g.userGameCount + 1 } : g));

                        const newGameGenres = await getGameGenres(
                          newUserGame.game_id
                        );
                        const newGamePlatforms = await getGamePlatforms(
                          newUserGame.game_id
                        );
                        setGamePlatforms((prev) => [
                          ...prev,
                          ...newGamePlatforms,
                        ]);
                        setGameGenres((prev) => [...prev, ...newGameGenres]);

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
                    className="button-addgame"
                    onClick={() =>
                      navigate(`/reviews/${game.id}`, {
                        state: { game, fromGameReview: true },
                      })
                    }
                  >
                    View Reviews
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

}

export default AddGamePage;

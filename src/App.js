// App.js
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import GameListPage from './pages/gamelistpage';
import ReviewPage from './pages/reviewpage';
import AdminPage from './pages/AdminPage';
import ViewReviewPage from './pages/viewReviewPage';
import AddGamePage from './pages/addGamePage';
import AchivevementPage from './pages/achievementPage';
import CreateUserPage from './pages/createuserPage';
import { UserProvider } from './context/UserContext';
import { PlatformProvider } from './context/PlatformContext';
import { GenreProvider } from './context/GenreContext';
import { useUser } from './context/UserContext';
import { useGames } from './context/GameContext';
import { useGameGenres } from './context/GameGenreContext';
import { useGenres } from './context/GenreContext';
import { usePlatforms } from './context/PlatformContext';
import { useGamePlatforms } from './context/GamePlatformContext';
import { useUserGames } from './context/UserGameContext';
import { GameProvider } from './context/GameContext';
import { UserGameProvider } from './context/UserGameContext';
import { GameGenreProvider } from './context/GameGenreContext';
import { AchievementProvider } from './context/AchievementContext';
import { GamePlatformProvider } from './context/GamePlatformContext';
import { loginToSite } from './api/usersApi';
import { getUserGamesByUserId } from './api/userGamesApi';
import { getGames } from './api/gameApi';
import { getGame } from './api/gameApi';
import { getGameGenres } from './api/gameGenresApi';
import { getGamePlatforms } from './api/gamePlatformApi';
import { getGenres, getGenresFromRawG, postRawGGenresToDatabase } from './api/genreApi';
import { getPlatforms, getPlatformsFromRawG, postRawGPlatformsToDatabase } from './api/platformApi';
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import gameReviewLogo from "./images/gameReviewLogo.png";

export const fetchUserGames = async (id, setUserGames) => {
  try {
    const userGames = await getUserGamesByUserId(id);
    await setUserGames(userGames);
    return userGames;
  } catch (error) {
    console.error('Failed to fetch userGames:', error);
  }
  return [];
};

export const fetchGames = async (setGames) => {
  try {
    const Games = await getGames();
    setGames(Games);
  } catch (error) {
    console.error('Failed to fetch Games:', error);
  }
};

export const fetchGame = async (setGames, games, game_id) => {
  try {
    const updatedGame = await getGame(game_id); // fetch updated game object

    // Create a new list with the updated game
    const updatedGames = games.map(game =>
      game.id === game_id ? updatedGame : game
    );

    setGames(updatedGames); // update state
  } catch (error) {
    console.error('Failed to update game in list:', error);
  }
};



export const fetchGameGenres = async (userGames, setGameGenres, currentGameGenres = []) => {
  try {
    const gameGenresList = await Promise.all(
      userGames.map(userGame => getGameGenres(userGame.game_id))
    );

    const flatList = gameGenresList.flat();

    // ✅ Combine with existing and deduplicate
    const all = [...currentGameGenres, ...flatList];
    const unique = Array.from(new Map(all.map(g => [g.id, g])).values());

    setGameGenres(unique);
  } catch (error) {
    console.error('Failed to fetch GameGenres:', error);
  }
};

export const fetchGamePlatforms = async (userGames, setGamePlatforms, currentGamePlatforms = []) => {
  try {
    const gamePlatformsList = await Promise.all(
      userGames.map(userGame => getGamePlatforms(userGame.game_id))
    );

    const flatList = gamePlatformsList.flat();

    // ✅ Combine with existing and deduplicate
    const all = [...currentGamePlatforms, ...flatList];
    const unique = Array.from(new Map(all.map(p => [p.id, p])).values());

    setGamePlatforms(unique);
  } catch (error) {
    console.error('Failed to fetch GamePlatforms:', error);
  }
};


function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useUser();
  const { setUserGames } = useUserGames();
  const { setGames } = useGames();
  const { setGenres } = useGenres();
  const { setGameGenres } = useGameGenres();
  const { setPlatforms } = usePlatforms();
  const { setGamePlatforms } = useGamePlatforms();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const usernameInputRef = useRef(null);
  const [inputFocus, setInputFocus] = React.useState({ username: false, password: false });

  useEffect(() => {
    document.title = "Game Review";
  }, []);


  useEffect(() => {

    usernameInputRef.current?.focus();

  }, []);

  useEffect(() => {
    // ✅ Remove token & user on refresh
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  }, []);




  const handleLogin = async (e) => {




    const fetchPlatforms = async () => {
      try {
        //old await fetchPlatformsFromRawG();
        const Platforms = await getPlatforms();
        setPlatforms(Platforms);
      } catch (error) {
        console.error('Failed to fetch Platforms:', error);
      }
    };


    const fetchPlatformsFromRawG = async () => {
      try {
        let rawGPlatformssList = {
          next: null
        };
        do {
          rawGPlatformssList = await getPlatformsFromRawG(rawGPlatformssList.next);
          await postRawGPlatformsToDatabase(rawGPlatformssList.results);
        } while (rawGPlatformssList.next != null);

      } catch (error) {
        console.error('Failed to fetch Platforms from rawG:', error);
      }
    };



    const fetchGenres = async () => {
      try {
        // old await fetchGenresFromRawG();
        const Genres = await getGenres();
        setGenres(Genres);
      } catch (error) {
        console.error('Failed to fetch Genres:', error);
      }
    };

    const fetchGenresFromRawG = async () => {
      try {
        let rawGGenresList = {
          next: null
        };
        do {
          rawGGenresList = await getGenresFromRawG(rawGGenresList.next);
          await postRawGGenresToDatabase(rawGGenresList.results);
        } while (rawGGenresList.next != null);

      } catch (error) {
        console.error('Failed to fetch Genres:', error);
      }
    };





    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const response = await loginToSite({ username, password });



      if (response.success) {
        login(response.data.user, response.data.token);
        console.log("Logged in:", response.data);
        // optionally store in state/context too
      }
      else {
        const statusText = response.status ? ` ${response.status}` : "";
        const errorText = response.error || "Unknown error";
        alert(`Login error:${statusText} — ${errorText}`);
        return;
      }



      const userObject = response.data;

      await fetchGames(setGames);
      await fetchGenres();
      await fetchPlatforms();

      const userGames = await fetchUserGames(userObject.user.id, setUserGames);
      await fetchGamePlatforms(userGames, setGamePlatforms);
      await fetchGameGenres(userGames, setGameGenres);

      navigate(`/gamelistpage`);
    } catch (error) {
      console.error('Login error:', error);
      alert(error);
    } finally {
      setIsLoggingIn(false); // ✅ ensure it's reset even on error
    }
  };
  const styles = {
    container: {
      maxWidth: '400px',
      margin: '3rem auto',
      padding: '2rem',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      backgroundColor: '#fff',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    heading: {
      textAlign: 'center',
      marginBottom: '1.5rem',
      color: '#333',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
    },
    input: {
      width: '100%',              // ✅ Make inputs full width
      padding: '0.75rem 1rem',
      marginBottom: '1rem',
      fontSize: '1rem',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: '#ccc',
      borderRadius: '4px',
      outline: 'none',
      transition: 'border-color 0.3s',
      boxSizing: 'border-box',    // ✅ Prevent overflow issues
    },
    inputFocus: {
      borderColor: '#007bff',
      boxShadow: '0 0 0 3px rgba(0,123,255,0.25)',
    },
    button: {
      width: '100%',              // ✅ Make button same width
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      borderRadius: '4px',
      border: 'none',
      backgroundColor: '#007bff',
      color: '#fff',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    buttonDisabled: {
      backgroundColor: '#6c757d',
      cursor: 'not-allowed',
    },
    createUserLink: {
      marginTop: '1rem',
      textAlign: 'center',
      color: '#007bff',
      textDecoration: 'underline',
      cursor: 'pointer',
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: '4rem',
      color: '#666',
    },
  };




  return (

    <div style={styles.container}>

      {/* Logo Section */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <img
          src={gameReviewLogo}
          alt="GameReview Logo"
          style={{ width: "150px", height: "auto" }}
        />
      </div>

      <h2 style={styles.heading}>Login</h2>

      <form onSubmit={handleLogin} style={styles.form}>
        <input
          ref={usernameInputRef}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            ...styles.input,
            ...(inputFocus.username ? styles.inputFocus : {}),
          }}
          onFocus={() => setInputFocus(f => ({ ...f, username: true }))}
          onBlur={() => setInputFocus(f => ({ ...f, username: false }))}
          autoComplete="username"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            ...styles.input,
            ...(inputFocus.password ? styles.inputFocus : {}),
          }}
          onFocus={() => setInputFocus(f => ({ ...f, password: true }))}
          onBlur={() => setInputFocus(f => ({ ...f, password: false }))}
          autoComplete="current-password"
          required
        />
        <button
          type="submit"
          disabled={isLoggingIn}
          style={isLoggingIn ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
        >
          {isLoggingIn ? (
            <>
              Logging in... <FaSpinner className="spin" />
            </>
          ) : (
            'Login'
          )}
        </button>
      </form>

      <div style={styles.createUserLink}>
        <Link to="/createuserPage" style={{ color: 'inherit', textDecoration: 'inherit' }}>
          Create User
        </Link>
      </div>
    </div>

  );
}

function App() {
  return (
    <>
      <GamePlatformProvider>
        <PlatformProvider>
          <GameGenreProvider>
            <GenreProvider>
              <UserProvider>
                <AchievementProvider>
                  <UserGameProvider>
                    <GameProvider>
                      <Router>
                        <Routes>
                          <Route path="/" element={<LoginPage />} />
                          <Route path="/gamelistpage" element={<GameListPage />} />
                          <Route path="/reviewpage/:id" element={<ReviewPage />} />
                          <Route path="/addgamepage" element={<AddGamePage />} />
                          <Route path="/achievementpage" element={<AchivevementPage />} />
                          <Route path="/createuserpage" element={<CreateUserPage />} />
                          <Route path="/reviews/:gameId" element={<ViewReviewPage />} />
                          <Route path="/adminpage" element={<AdminPage />} />
                        </Routes>
                      </Router>
                    </GameProvider>
                  </UserGameProvider>
                </AchievementProvider>
              </UserProvider>
            </GenreProvider>
          </GameGenreProvider>
        </PlatformProvider>
      </GamePlatformProvider>
    </>
  );
}

export default App;
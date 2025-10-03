// App.js
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import { FaSpinner } from 'react-icons/fa';
import GameListPage from './pages/gamelistpage';
import ReviewPage from './pages/reviewpage';
import AddGamePage from './pages/addGamePage';
import AchivevementPage from './pages/achievementPage';
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
import { getUsers } from './api/usersApi';
import { getUserGames } from './api/userGamesApi';
import { getGames } from './api/gameApi';
import { getGameGenres } from './api/gameGenresApi';
import { getGamePlatforms } from './api/gamePlatformApi';
import { getGenres, getGenresFromRawG, postRawGGenresToDatabase } from './api/genreApi';
import { getPlatforms, getPlatformsFromRawG, postRawGPlatformsToDatabase } from './api/platformApi';
import { useEffect, useState } from 'react';


export const fetchUserGames = async (id, setUserGames) => {
  try {
    const userGames = await getUserGames(id);
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

export const fetchGameGenres = async (userGames, setGameGenres) => {
  try {

    const gameGenresList = await Promise.all(
      userGames.map(userGame => getGameGenres(userGame.game_id))
    );
    setGameGenres(gameGenresList.flat());
  } catch (error) {
    console.error('Failed to fetch GameGenres from rawG:', error);
  }
};

export const fetchGamePlatforms = async (userGames, setGamePlatforms) => {
  try {

    const gamePlatformsList = await Promise.all(
      userGames.map(usergame => getGamePlatforms(usergame.game_id))
    );
    setGamePlatforms(gamePlatformsList.flat());
  } catch (error) {
    console.error('Failed to fetch GamePlatforms:', error);
  }
};

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const navigate = useNavigate();
  const { setUser } = useUser();
  const { setUserGames } = useUserGames();
  const { setGames } = useGames();
  const { setGenres } = useGenres();
  const { setGameGenres } = useGameGenres();
  const { setPlatforms } = usePlatforms();
  const { setGamePlatforms } = useGamePlatforms();
  const [isLoggingIn, setIsLoggingIn] = useState(false);


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getUsers();
        setAllUsers(users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);


  const handleLogin = async (e) => {




    const fetchPlatforms = async () => {
      try {
        await fetchPlatformsFromRawG();
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
        await fetchGenresFromRawG();
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

    console.log(allUsers)
    try {
      const userObject = allUsers.find(
        u => u.username.trim() === username.trim() &&
          u.password === password // consider hashing in real apps
      );

      if (!userObject) {
        alert('Invalid credentials');
        return;
      }

      setUser(userObject);

      await fetchGames(setGames);
      await fetchGenres();
      await fetchPlatforms();

      const userGames = await fetchUserGames(userObject.id, setUserGames);
      await fetchGamePlatforms(userGames, setGamePlatforms);
      await fetchGameGenres(userGames, setGameGenres);

      navigate(`/gamelistpage`);
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong during login.');
    } finally {
      setIsLoggingIn(false); // ✅ ensure it's reset even on error
    }
  };




  return (
    allUsers && allUsers.length > 0 ? (
      <div className="App">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          /><br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          /><br />
          <button type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? (
              <>
                Logging in... <FaSpinner className="spin" />
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    ) : (
      <div className="App">
        <h2>Loading...</h2>
        <FaSpinner className="spin" />
      </div>
    )
  );

}


function App() {

  return (
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
  );
}

export default App;
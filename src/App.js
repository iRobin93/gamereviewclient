// App.js
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
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


    const fetchGames = async () => {
      try {
        const Games = await getGames();
        setGames(Games);
      } catch (error) {
        console.error('Failed to fetch Games:', error);
      }
    };


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

    const fetchGameGenres = async (userGames) => {
      try {

        const gameGenresList = await Promise.all(
          userGames.map(game => getGameGenres(game.game_id))
        );
        setGameGenres(gameGenresList.flat());
      } catch (error) {
        console.error('Failed to fetch GameGenres from rawG:', error);
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

    const fetchUserGames = async (id) => {
      try {
        const userGames = await getUserGames(id);
        await setUserGames(userGames);
        return userGames;
      } catch (error) {
        console.error('Failed to fetch userGames:', error);
      }
      return [];
    };

    const fetchGamePlatforms = async (userGames) => {
      try {

        const gamePlatformsList = await Promise.all(
          userGames.map(game => getGamePlatforms(game.game_id))
        );
        setGamePlatforms(gamePlatformsList.flat());
      } catch (error) {
        console.error('Failed to fetch GamePlatforms:', error);
      }
    };

    e.preventDefault();

    const userObject = allUsers.find(
      u => u.username === username && u.password === password
    );

    if (userObject) {
      setUser(userObject);
      await fetchGames();
      await fetchGenres();
      await fetchPlatforms();

      const userGames = await fetchUserGames(userObject.id);
      await fetchGamePlatforms(userGames);
      await fetchGameGenres(userGames);
      navigate(`/gamelistpage`);
    } else {
      alert('Invalid credentials');
    }
  };




  return (
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
        <button type="submit">Login</button>
      </form>
    </div>
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
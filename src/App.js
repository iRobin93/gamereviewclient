// App.js
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import GameListPage from './pages/gamelistpage';
import ReviewPage from './pages/reviewpage';
import AddGamePage from './pages/addGamePage';
import AchivevementPage from './pages/achievementPage';
import { UserProvider } from './context/UserContext';
import { GenreProvider } from './context/GenreContext';
import { useUser } from './context/UserContext';
import { useGames } from './context/GameContext';
import { useGameGenres } from './context/GameGenreContext';
import { useGenres } from './context/GenreContext';
import { useUserGames } from './context/UserGameContext';
import { GameProvider } from './context/GameContext';
import { UserGameProvider } from './context/UserGameContext';
import { GameGenreProvider } from './context/GameGenreContext';
import { AchievementProvider } from './context/AchievementContext';
import { getUsers } from './api/usersApi';
import { getUserGames } from './api/userGamesApi';
import { getGames } from './api/gameApi';
import { getGameGenres } from './api/gameGenresApi';
import { getGenres } from './api/genreApi';
import { useEffect, useState } from 'react';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const navigate = useNavigate();
  const { setUser } = useUser();
  const { usergames, setUserGames } = useUserGames();
  const { games, setGames } = useGames();
  const { setGenres } = useGenres();
  const { setGameGenres } = useGameGenres();



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


    const fetchGameGenres = async (userGames) => {
      try {

        const gameGenresList = await Promise.all(
          userGames.map(game => getGameGenres(game.game_id))
        );
        setGameGenres(gameGenresList.flat());
      } catch (error) {
        console.error('Failed to fetch GameGenres:', error);
      }
    };

    const fetchGenres = async () => {
      try {
        const Genres = await getGenres();
        setGenres(Genres);
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

    e.preventDefault();

    const userObject = allUsers.find(
      u => u.username === username && u.password === password
    );

    if (userObject) {
      setUser(userObject);
      await fetchGames();
      await fetchGenres();
      const userGames = await fetchUserGames(userObject.id);
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
  );
}

export default App;
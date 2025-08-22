// App.js
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import GameListPage from './pages/gamelistpage';
import ReviewPage from './pages/reviewpage';
import AddGamePage from './pages/addGamePage';
import { UserProvider } from './context/UserContext';
import { useUser } from './context/UserContext';
import { GameProvider } from './context/GameContext';
import { UserGameProvider } from './context/UserGameContext';
import { getUsers } from './api/usersApi';
import { useEffect, useState } from 'react';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const navigate = useNavigate();
  const { setUser } = useUser();


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


  const handleLogin = (e) => {
    e.preventDefault();

   const userObject = allUsers.find(
      u => u.username === username && u.password === password
    );

    if (userObject) {
      setUser(userObject);
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
    <UserProvider>
      <UserGameProvider>
      <GameProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/gamelistpage" element={<GameListPage />} />
          <Route path="/reviewpage/:id" element={<ReviewPage />} />
          <Route path="/addgamepage" element={<AddGamePage />} />
        </Routes>
      </Router>
      </GameProvider>
      </UserGameProvider>
    </UserProvider>
  );
}

export default App;
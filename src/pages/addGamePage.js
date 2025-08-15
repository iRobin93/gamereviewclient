import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGames } from '../context/GameContext';
import { useUserGames } from '../context/UserGameContext';
import { useUser } from '../context/UserContext';


function AddGamePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const apiKey = "b1a02be62e9140459f53df733ff56c1e"; // Secure via env
    const navigate = useNavigate();
    const { user } = useUser();
    const { games, setGames } = useGames();
    const {usergames, setUserGames} = useUserGames();
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);

    try {
      const response = await fetch(
        `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(searchTerm)}`
      );
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

    const getNewGameId = () => {
        const existingIds = games.map(game => game.id);
        let id = 1;
        while (existingIds.includes(id)) {
            id++;
        }
        return id;
    };

    const getNewUserGameId = () => {
        const existingIds = usergames.map(usergame => usergame.id);
        let id = 1;
        while (existingIds.includes(id)) {
            id++;
        }
        return id;
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
                    onClick={() => {
                        const newGame = {
                            id: getNewGameId(),
                            title: game.name,
                            coverImage: game.background_image,
                            genre: '', // Fill as needed
                            platform: '',
                            releaseDate: game.released,
                            status: 'not-started',
                            reviewed: false,
                        };
                        setGames([...games, newGame]);
                        const newUserGame = {
                            id: getNewUserGameId(),
                            rating: undefined,
                            reviewed: false,
                            reviewText: "",
                            status: "Not Started",
                            game_id: newGame.id,
                            user_id: user.id
                        }
                        setUserGames([...usergames, newUserGame])
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

import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [games, setGames] = useState([]);
  const [gamesNeedRefresh, setGamesNeedRefresh] = useState(false);
  return (
    <GameContext.Provider value={{ games, setGames, gamesNeedRefresh, setGamesNeedRefresh }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGames() {
  return useContext(GameContext);
}
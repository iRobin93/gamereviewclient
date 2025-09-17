import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [games, setGames] = useState(null);

  return (
    <GameContext.Provider value={{ games, setGames }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGames() {
  return useContext(GameContext);
}
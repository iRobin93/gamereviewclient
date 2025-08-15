import React, { createContext, useContext, useState } from 'react';
import { initialGames } from '../model/gamesData';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [games, setGames] = useState(initialGames);

  return (
    <GameContext.Provider value={{ games, setGames }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGames() {
  return useContext(GameContext);
}
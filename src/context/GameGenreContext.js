import React, { createContext, useContext, useState } from 'react';

const GameGenreContext = createContext();

export function GameGenreProvider({ children }) {
  const [gamegenres, setGameGenres] = useState(null);

  return (
    <GameGenreContext.Provider value={{ gamegenres, setGameGenres }}>
      {children}
    </GameGenreContext.Provider>
  );
}

export function useGameGenres() {
  return useContext(GameGenreContext);
}
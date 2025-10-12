import React, { createContext, useContext, useState } from 'react';

const GamePlatformContext = createContext();

export function GamePlatformProvider({ children }) {
  const [gameplatforms, setGamePlatforms] = useState([]);




  return (
    <GamePlatformContext.Provider value={{ gameplatforms, setGamePlatforms}}>
      {children}
    </GamePlatformContext.Provider>
  );
}

export function useGamePlatforms() {
  return useContext(GamePlatformContext);
}
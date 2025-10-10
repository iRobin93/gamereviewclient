import React, { createContext, useContext, useState } from 'react';

const GamePlatformContext = createContext();

export function GamePlatformProvider({ children }) {
  const [gameplatforms, setGamePlatforms] = useState([]);
  const [gamePlatformsNeedRefresh, setGamePlatformsNeedRefresh] = useState(false);




  return (
    <GamePlatformContext.Provider value={{ gameplatforms, setGamePlatforms , gamePlatformsNeedRefresh, setGamePlatformsNeedRefresh}}>
      {children}
    </GamePlatformContext.Provider>
  );
}

export function useGamePlatforms() {
  return useContext(GamePlatformContext);
}
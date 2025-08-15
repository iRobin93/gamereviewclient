import React, { createContext, useContext, useState } from 'react';
import { initialUserGames } from '../model/userGamesData';

const UserGameContext = createContext();

export function UserGameProvider({ children }) {
  const [usergames, setUserGames] = useState(initialUserGames);

  return (
    <UserGameContext.Provider value={{ usergames, setUserGames }}>
      {children}
    </UserGameContext.Provider>
  );
}

export function useUserGames() {
  return useContext(UserGameContext);
}
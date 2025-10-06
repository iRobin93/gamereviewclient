import React, { createContext, useContext, useState } from 'react';

const UserGameContext = createContext();

export function UserGameProvider({ children }) {
  const [usergames, setUserGames] = useState([]);
  const [usergamesNeedRefresh, setUsergamesNeedRefresh] = useState(false);
  return (
    <UserGameContext.Provider value={{ usergames, setUserGames, usergamesNeedRefresh, setUsergamesNeedRefresh }}>
      {children}
    </UserGameContext.Provider>
  );
}

export function useUserGames() {
  return useContext(UserGameContext);
}
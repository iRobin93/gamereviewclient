import React, { createContext, useContext, useState } from 'react';

const UserGameContext = createContext();

export function UserGameProvider({ children }) {
  const [usergames, setUserGames] = useState(null);

  return (
    <UserGameContext.Provider value={{ usergames, setUserGames }}>
      {children}
    </UserGameContext.Provider>
  );
}

export function useUserGames() {
  return useContext(UserGameContext);
}
import React, { createContext, useContext, useState } from 'react';

const GenreContext = createContext();

export function GenreProvider({ children }) {
  const [genres, setGenres] = useState(null);
  return (
    <GenreContext.Provider value={{ genres, setGenres}}>
      {children}
    </GenreContext.Provider>
  );
}

export function useGenres() {
  return useContext(GenreContext);
}
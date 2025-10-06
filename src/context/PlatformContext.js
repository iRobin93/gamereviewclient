import React, { createContext, useContext, useState } from 'react';

const PlatformContext = createContext();

export function PlatformProvider({ children }) {
  const [platforms, setPlatforms] = useState([]);

  return (
    <PlatformContext.Provider value={{ platforms, setPlatforms }}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatforms() {
  return useContext(PlatformContext);
}
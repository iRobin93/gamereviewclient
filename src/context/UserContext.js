// src/context/UserContext.js
import React, { createContext, useState, useEffect, useContext } from "react";


const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);



  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    sessionStorage.setItem("token", tokenData);
    sessionStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
  };
  // 🧠 Load user/token from localStorage on app start
  useEffect(() => {
    const savedToken = sessionStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, token, setToken, logout, login }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for easy use
export const useUser = () => useContext(UserContext);

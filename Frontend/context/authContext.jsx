import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const userToken = Cookies.get('userToken');
    const user = Cookies.get('user');

    if (userToken && user) {
      setToken(userToken);
      setUserData(JSON.parse(user));
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token, user) => {
    Cookies.set('userToken', token, { expires: 7 });
    Cookies.set('user', JSON.stringify(user), { expires: 7 });

    setToken(token);
    setUserData(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    console.log("Logout clicked");

    Cookies.remove('userToken');
    Cookies.remove('user');

    setToken(null);
    setUserData(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ token, userData, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

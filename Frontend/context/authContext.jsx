//this file remembers whether the user is logged in across all pages of your React app.
import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie'; //it is a library that makes it easy to read and write browser cookies

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // These 3 variables are stored in memory while the app is running --> token, userdata and isAuth..

  useEffect(() => { // Remembering Login After Refresh

    const userToken = Cookies.get('userToken');
    const user = Cookies.get('user');

    if (userToken && user) {
      setToken(userToken);
      setUserData(JSON.parse(user));
      setIsAuthenticated(true);
    }
  }, []);
  // Remembering Login After Refresh

  const login = (token, user) => {
    Cookies.set('userToken', token, { expires: 7 }); // saved for 7 days
    Cookies.set('user', JSON.stringify(user), { expires: 7 });

    // Saves to React state (available instantly to all components):
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
    //value={{ ... }} is what gets shared with every component inside the provider.
    //  The children means every component wrapped inside AuthProvider in your main.jsx.
  );
};

export const useAuth = () => useContext(AuthContext);
//This is a shortcut. Instead of writing this in every component:
// javascriptimport { useContext } from 'react';
// import { AuthContext } from '../context/authContext';
// const auth = useContext(AuthContext);

import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('auth-token');
    const storedEmail = sessionStorage.getItem('email');
    const storedName = sessionStorage.getItem('name');

    if (token) {
      setIsLoggedIn(true);
      if (storedEmail) setUserEmail(storedEmail);
      if (storedName) setUserName(storedName);
    }
  }, []);

  const login = (token, email, name) => {
    sessionStorage.setItem('auth-token', token);
    sessionStorage.setItem('email', email);
    if (name) sessionStorage.setItem('name', name);
    setIsLoggedIn(true);
    setUserEmail(email);
    if (name) setUserName(name);
  };

  const logout = () => {
    sessionStorage.removeItem('auth-token');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('name');
    setIsLoggedIn(false);
    setUserEmail('');
    setUserName('');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userEmail, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

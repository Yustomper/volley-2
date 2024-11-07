import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_API
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const login = async (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    
    // Configurar el token para futuras peticiones
    axios.defaults.headers.common['Authorization'] = `Token ${newToken}`;
    
    try {
      // Hacer una petición para obtener los datos del usuario
      const response = await axios.get(`${API_URL}/api/auth/user/`);
      const userData = response.data;
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
    }
  };

  const registerSuccess = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Token ${newToken}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ token, user, login, registerSuccess, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
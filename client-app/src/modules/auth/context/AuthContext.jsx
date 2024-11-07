// client-app/src/modules/auth/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAuthToken, removeAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const navigate = useNavigate();

  const login = async (credentials) => {
    try {
      const response = await api.login(credentials);
      const { token, email, username, user_id } = response.data;

      // Guarda el token y el usuario en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ email, username, user_id }));
      
      setToken(token);
      setUser({ email, username, user_id });
      setAuthToken(token);  // Configura el token globalmente
    } catch (error) {
      throw error.response?.data?.error || 'Error en el inicio de sesión';
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      removeAuthToken();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
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

// src/modules/auth/services/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_API;

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para configurar el token en cada solicitud
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log("Solicitando a URL completa:", config.baseURL + config.url);
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para manejar errores de autorización
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si el token no es válido o ha expirado, limpiar el almacenamiento
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Aquí podrías agregar una redirección a /login si lo deseas
    }
    return Promise.reject(error);
  }
);

api.login = (credentials) => api.post('/api/users/login/', credentials);
api.register = (credentials) => api.post('/api/users/register/', credentials);
api.logout = () => api.post('/api/users/logout/');

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

export const removeAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
  localStorage.removeItem('token');
};

export default api;
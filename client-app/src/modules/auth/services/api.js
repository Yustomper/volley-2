// src/modules/auth/services/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_API;

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para mostrar la URL completa de cada solicitud
api.interceptors.request.use((config) => {
   console.log("Solicitando a URL completa:", config.baseURL + config.url);
  return config;
}, (error) => {
  return Promise.reject(error);
});


api.login = (credentials) => api.post('/api/users/login/', credentials);
api.register = (credentials) => api.post('/api/users/register/', credentials);
api.logout = () => api.post('/api/users/logout/');


export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};
api.login = (credentials) => api.post('/api/users/login/', credentials);
api.register = (credentials) => api.post('/api/users/register/', credentials);
api.logout = () => api.post('/api/users/logout/');
export const removeAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

export default api;

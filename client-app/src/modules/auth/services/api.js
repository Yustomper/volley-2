// client-app/src/modules/auth/services/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_API;

const api = axios.create({
  baseURL: API_URL,
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;  // Cambiado a 'Bearer'
  }
};

export const removeAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

export default {
  login: (credentials) => api.post(`/api/users/login/`, credentials),
  register: (userData) => api.post(`/api/users/register/`, userData),
  logout: () => api.post(`/api/users/logout/`),
  setAuthToken,
  removeAuthToken,
};

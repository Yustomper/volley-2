// src/services/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_API;


// Función para crear una instancia de axios con el token
const createAxiosInstance = () => {
  const token = localStorage.getItem("token");
  return axios.create({
    baseURL: API_URL,
    headers: token ? { Authorization: `Token ${token}` } : {},
  });
};

const api = {
  // Autenticación
  login: (credentials) => axios.post(`${API_URL}/api/users/login/`, credentials),
  register: (userData) => axios.post(`${API_URL}/api/users/register/`, userData),

  logout: () => createAxiosInstance().post(`/api/users/logout/`),

  // Usuario
  getCurrentUser: () => createAxiosInstance().get(`/api/users/user/`),

}

export default api;

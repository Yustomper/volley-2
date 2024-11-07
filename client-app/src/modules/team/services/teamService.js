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
  // Equipos con paginación, búsqueda y ordenamiento
  getTeams: ({ page = 1, search = "", ordering = "name" } = {}) =>
    createAxiosInstance().get(`/api/teams/`, {
      params: {
        page,
        search,
        ordering,
      },
    }),
  createTeam: (teamData) => createAxiosInstance().post(`/api/teams/`, teamData),
  updateTeam: (teamId, teamData) =>
    createAxiosInstance().put(`/api/teams/${teamId}/`, teamData),
  deleteTeam: (teamId) => createAxiosInstance().delete(`/api/teams/${teamId}/`),

  // Jugadores con paginación, búsqueda y ordenamiento
  getPlayers: ({ page = 1, search = "", ordering = "name" } = {}) =>
    createAxiosInstance().get(`/api/teams/players/`, {
      params: {
        page,
        search,
        ordering,
      },
    }),
  createPlayer: (playerData) =>
    createAxiosInstance().post(`/api/teams/players/`, playerData),
  updatePlayer: (playerId, playerData) =>
    createAxiosInstance().put(`/api/teams/players/${playerId}/`, playerData),
  deletePlayer: (playerId) =>
    createAxiosInstance().delete(`/api/teams/players/${playerId}/`),
  removePlayerFromTeam: (teamId, playerId) =>
    createAxiosInstance().delete(`/api/teams/${teamId}/remove-player/${playerId}/`),

};


export default api;

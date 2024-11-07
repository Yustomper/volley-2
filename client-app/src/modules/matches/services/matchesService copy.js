// src/services/api.js
import axios from "axios";
import { weatherService } from "../../../services/weatherService";

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

  getTeams: () => createAxiosInstance().get(`/api/teams/`),

  // return get teams id
  getTeamID: (teamId) => createAxiosInstance().get(`/api/teams/${teamId}/`),

  

  // Matches
  getMatches: (params) => createAxiosInstance().get("/api/matches/", { params }),
  getMatch: (id) => createAxiosInstance().get(`/api/matches/${id}/`),
  createMatch: (matchData) => createAxiosInstance().post("/api/matches/", matchData),
  updateMatch: (id, matchData) => createAxiosInstance().put(`/api/matches/${id}/`, matchData),
  deleteMatch: (id) => createAxiosInstance().delete(`/api/matches/${id}/`),

  // Nuevos métodos para el partido de voleibol
  startMatch: (matchId) => createAxiosInstance().post(`/api/matches/${matchId}/start/`),
  endMatch: (matchId) => createAxiosInstance().post(`/api/matches/${matchId}/end/`),
  updateMatchScore: (matchId, data) => createAxiosInstance().patch(`/api/matches/${matchId}/update_score/`, data),
  
  // Corregido aquí el método de performance para evitar dobles // en las rutas
  updatePlayerPerformance: (performanceId, data) =>
    createAxiosInstance().put(`/api/matches/performances/${performanceId}/`, data),

  // Sets
  endSet: async (matchId) => {
    return createAxiosInstance().post(`/api/matches/${matchId}/sets/end_set/`, {
      
    }
  );
    
  },
 
  startSet: async (matchId) => {
    return createAxiosInstance().post(`/api/matches/${matchId}/sets/start_set/`), {
      
    }
  },

  // Estadísticas
  getMatchStatistics: (matchId) => createAxiosInstance().get(`/api/statistics/match/${matchId}/`),

  

  // Clima

  getWeather: async (latitude, longitude, date) => {
    try {
      console.log('Llamando a getWeather con:', { latitude, longitude, date });
      const weatherData = await weatherService.getWeather(latitude, longitude, date);
      console.log('Datos del clima obtenidos:', weatherData);
      return weatherData;
    } catch (error) {
      console.error('Error al obtener el clima:', error);
      throw error;
    }
  },

  // Nuevo método updateMatchWeather:
  // 1. Este método se encarga específicamente de enviar los datos del clima al backend.
  // 2. Utiliza el endpoint correcto en el backend.
  updateMatchWeather: async (matchId, weatherData) => {
    try {
      const response = await createAxiosInstance().post(`/api/weather/update_match_weather/`, {
        match_id: matchId,
        temperature: weatherData.temperature,
        condition: weatherData.condition
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el clima en el backend:', error);
      throw error;
    }
  }

};


export default api;

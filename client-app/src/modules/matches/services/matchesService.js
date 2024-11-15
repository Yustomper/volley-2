// src/modules/matches/services/servicesMatches.js

import api from "../../auth/services/api";


const matchesApi = {

  getWeather: async (matchId) => {
    try {
      const response = await api.get(`/api/matches/${matchId}/weather/`);
      return response;
    } catch (error) {
      console.error('Error getting weather:', error);
      throw error;
    }
  },

  // Obtener todos los partidos con filtros opcionales
  getMatches: (params) => api.get(`/api/matches/`, { params }),

  // Crear un nuevo partido
  createMatch: (matchData) => api.post(`/api/matches/`, matchData),

  // Obtener detalles de un partido específico
  getMatch: (matchId) => api.get(`/api/matches/${matchId}/`),

  getMatchPerformance: async (matchId) => {
    const response = await api.get(`/api/matches/${matchId}/performance/`);
    return response;
  },

  // Actualizar un partido existente
  updateMatch: (matchId, matchData) => api.put(`/api/matches/${matchId}/`, matchData),

  // Eliminar un partido específico
  deleteMatch: (matchId) => api.delete(`/api/matches/${matchId}/`),

  // Registrar rendimiento de jugador en un set
  getPlayerPerformance: (matchId) => {
    return api.get(`/api/matches/${matchId}/performance/`);
  },

  updatePlayerPerformance: async (matchId, performanceData) => {
    const response = await api.patch(`/api/matches/${matchId}/performance/`, performanceData);
    return response;
  },

  revertLastPoint: async (matchId, performanceData) => {
    try {
      const response = await api.delete(`/api/matches/${matchId}/performance/`, {
        data: performanceData  // Importante: usar 'data' para enviar el cuerpo en DELETE
      });
      return response;
    } catch (error) {
      console.error('Error en revertLastPoint:', error);
      throw error;
    }
  },


  substitutePlayer: async (matchId, data) => {
    try {
      console.log('Enviando datos a la API:', { matchId, data });
      const response = await api.post(`/api/matches/${matchId}/substitute/`, data);
      return response.data;
    } catch (error) {
      console.error('Error en substitutePlayer:', error.response?.data || error);
      throw error;
    }
  },
  // Registrar tiempo fuera
  requestTimeout: async (matchId, data) => {
    return await api.post(`/api/matches/${matchId}/timeout/`, data);
  },

  // Iniciar un partido
  startMatch: (matchId) => api.post(`/api/matches/${matchId}/start/`),

  

};

export default matchesApi;

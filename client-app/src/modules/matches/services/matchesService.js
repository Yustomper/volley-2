// src/modules/matches/services/servicesMatches.js

import api from "../../auth/services/api";

const matchesApi = {
  // Obtener todos los partidos con filtros opcionales
  getMatches: (params) => api.get(`/api/matches/`, { params }),

  // Crear un nuevo partido
  createMatch: (matchData) => api.post(`/api/matches/`, matchData),

  // Obtener detalles de un partido específico
  getMatch: (matchId) => api.get(`/api/matches/${matchId}/`),

  // Actualizar un partido existente
  updateMatch: (matchId, matchData) => api.put(`/api/matches/${matchId}/`, matchData),

  // Eliminar un partido específico
  deleteMatch: (matchId) => api.delete(`/api/matches/${matchId}/`),

  // Registrar rendimiento de jugador en un set
  updatePlayerPerformance: (matchId, performanceData) =>
    api.patch(`/api/matches/${matchId}/performance/`, performanceData),

  // Realizar sustitución de jugadores
  substitutePlayer: (matchId, substitutionData) =>
    api.post(`/api/matches/${matchId}/substitute/`, substitutionData),

  // Registrar tiempo fuera
  registerTimeout: (matchId, timeoutData) =>
    api.post(`/api/matches/${matchId}/timeout/`, timeoutData),

  // Iniciar un partido
  startMatch: (matchId) => api.post(`/api/matches/${matchId}/start/`),

 
};

export default matchesApi;

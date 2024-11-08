// src/modules/team/services/teamService.js

import api from "../../auth/services/api";

const teamApi = {
  getTeams: (params) => api.get(`/api/teams/`, { params }),
  createTeam: (teamData) => api.post(`/api/teams/`, teamData),
  updateTeam: (teamId, teamData) => api.put(`/api/teams/${teamId}/`, teamData),
  deleteTeam: (teamId) => api.delete(`/api/teams/${teamId}/`),

  // Para casos donde necesitemos gestionar jugadores individualmente
  getPlayers: (params) => api.get(`/api/players/`, { params }),
  deletePlayer: (playerId) => api.delete(`/api/players/${playerId}/`),
};

export default teamApi;

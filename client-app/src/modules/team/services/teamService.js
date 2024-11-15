import api from "../../auth/services/api";

const teamApi = {
  getTeams: (params) => api.get(`/api/teams/`, { params }),
  createTeam: (teamData) => api.post(`/api/teams/`, teamData),
  updateTeam: (teamId, teamData) => api.put(`/api/teams/${teamId}/`, teamData),
  deleteTeam: (teamId) => api.delete(`/api/teams/${teamId}/`),

  compareTeams: (team1Id, team2Id) => api.get(`/api/compare/${team1Id}/${team2Id}/`),
  
  // Para casos donde necesitemos gestionar jugadores individualmente
  getPlayers: (params) => api.get(`/api/players/`, { params }),
  deletePlayer: (playerId) => api.delete(`/api/players/${playerId}/`),
};

export default teamApi;
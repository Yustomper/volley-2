// src/modules/team/services/tournamentService.js

import api from "../../auth/services/api";

const tournamentApi = {
    getTournaments: (params) => api.get(`/api/tournaments/`, { params }),
    createTournaments: (teamData) => api.post(`/api/tournaments/`, teamData),
    updateTournaments: (teamId, teamData) => api.put(`/api/tournaments/${teamId}/`, teamData),
    deleteTournaments: (teamId) => api.delete(`/api/tournaments/${teamId}/`),

    // Para casos donde necesitemos gestionar jugadores individualmente
    getPlayers: (params) => api.get(`/api/players/`, { params }),
    deletePlayer: (playerId) => api.delete(`/api/players/${playerId}/`),
};

export default tournamentApi;

// client-app/src/modules/team/hooks/useTeams.js

import { useState, useEffect } from 'react';
import teamApi from '../services/teamService';
import { toast } from 'react-toastify';

export const useTeams = ({ openModal, setEditingTeam, closeModal }) => {
  const [teams, setTeams] = useState([]); // Asegurarse que teams sea un array
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 6, total: 0 });
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchTeams();
  }, [search, orderBy, pagination.page]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamApi.getTeams({
        page: pagination.page,
        search,
        ordering: `${orderBy}_${sortOrder}`,
      });
      setTeams(response.data.results || []);
      setPagination((prev) => ({ ...prev, total: response.data.count }));
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Error al cargar los equipos');
    } finally {
      setLoading(false);
    }
  }
  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  const handleOrderBy = () => {
    setOrderBy((prev) => (prev === 'name' ? 'created_at' : 'name'));
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const handleRemoveTeam = async (teamId) => {
    try {
      await teamApi.deleteTeam(teamId);
      setTeams((prevTeams) => prevTeams.filter((team) => team.id !== teamId));
      toast.success('¡Equipo eliminado correctamente!');
    } catch (error) {
      toast.error('Error al eliminar el equipo');
    }
  };

  const handleRemovePlayer = async (teamId, playerId) => {
    try {
      await teamApi.deletePlayer(teamId, playerId);
      setTeams((prevTeams) =>
        prevTeams.map((team) => {
          if (team.id === teamId) {
            return {
              ...team,
              players: team.players.filter((player) => player.id !== playerId),
            };
          }
          return team;
        })
      );
      toast.success('¡Jugador eliminado correctamente!');
    } catch (error) {
      toast.error('Error al eliminar el jugador');
    }
  };

  const handleEditTeam = (team) => {
    setEditingTeam(team);
    openModal();
  };

  const handleAddTeam = async (team) => {
    try {
      const response = await teamApi.createTeam(team);
      setTeams((prevTeams) => [...prevTeams, response.data]);
      toast.success('¡Equipo creado correctamente!');
      closeModal();
    } catch (error) {
      toast.error('Error al crear el equipo. Verifica los requisitos.');
    }
  };

  const handleUpdateTeam = async (updatedTeam) => {
    try {
      const response = await teamApi.updateTeam(updatedTeam.id, updatedTeam);
      setTeams((prevTeams) => prevTeams.map((team) => (team.id === updatedTeam.id ? response.data : team)));
      toast.success('¡Equipo actualizado correctamente!');
      closeModal();
    } catch (error) {
      toast.error('Error al actualizar el equipo.');
    }
  };

  return {
    teams,
    loading,
    orderBy,
    sortOrder,
    handleSearch,
    handleOrderBy,
    handleRemoveTeam,
    handleRemovePlayer,
    handleEditTeam,
    handleAddTeam,
    handleUpdateTeam,
  };
};

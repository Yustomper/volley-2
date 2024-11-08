// client-app/src/modules/team/pages/Team.jsx

import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useTeams } from '../hooks/useTeams';
import { useModal } from '../hooks/useModal';
import TeamList from '../components/TeamList';
import AddTeamModal from '../components/AddTeamModal';
import ConfirmModal from '../components/ConfirmModal';
import { PlusIcon } from 'lucide-react';

export default function Team() {
  const { isDarkMode } = useTheme();
  const {
    isModalOpen, editingTeam, confirmModal, openModal, closeModal,
    closeConfirmModal, setEditingTeam
  } = useModal();

  const {
    teams, loading, orderBy, sortOrder, handleSearch, handleOrderBy,
    handleUpdateTeam, handleAddTeam, handleRemoveTeam, handleRemovePlayer, handleEditTeam
  } = useTeams({ openModal, setEditingTeam, closeModal });

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-orange-600'}`}>
            Gestión de Equipos
          </h1>
          <button
            onClick={openModal}
            className={`${isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-orange-500 hover:bg-orange-600'} text-white px-6 py-3 rounded-full transition duration-300 flex items-center`}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Crear Equipo
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <input
            type="text"
            placeholder="Buscar equipos..."
            className={`p-2 border rounded w-full md:w-96 focus:outline-none focus:ring-2 focus:ring-orange-500
              ${isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-black placeholder-gray-500'}`}
            onChange={handleSearch}
          />
          <button
            onClick={handleOrderBy}
            className={`${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'} 
              px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-orange-500`}
          >
            {orderBy === 'name' ? 'Ordenar por nombre' : 'Ordenar por fecha'}: {sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
          </button>
        </div>

        <TeamList
          teams={teams}
          loading={loading}
          handleRemoveTeam={(teamId) => handleRemoveTeam(teamId)}
          handleRemovePlayer={(teamId, playerId) => handleRemovePlayer(teamId, playerId)}
          handleEditTeam={handleEditTeam}
        />

        <AddTeamModal
          open={isModalOpen}
          onClose={closeModal}
          onSubmit={(team) => editingTeam ? handleUpdateTeam(team) : handleAddTeam(team)}
          editingTeam={editingTeam}
        />

        <ConfirmModal isOpen={confirmModal.isOpen} onClose={closeConfirmModal} />
      </div>
    </div>
  );
}

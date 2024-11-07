import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useTeams } from '../hooks/useTeams';
import { useModal } from '../hooks/useModal';
import TeamList from '../components/TeamList';
import AddTeamModal from '../components/AddTeamModal';
import ConfirmModal from '../components/ConfirmModal';
import { PlusIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Team() {
  const { isDarkMode } = useTheme();
  const {
    isModalOpen, editingTeam, confirmModal, openModal, closeModal,  
    closeConfirmModal, setEditingTeam
  } = useModal();

  const {
    teams, loading, pagination, orderBy, sortOrder, handlePageChange, handleSearch, handleOrderBy, 
    handleUpdateTeam, handleAddTeam, handleRemoveTeam, handleRemovePlayer, handleEditTeam
  } = useTeams({openModal, setEditingTeam, closeModal});

  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleTeamAction = async (action, ...args) => {
    try {
      await action(...args);
      showNotification('Operación realizada con éxito');
    } catch (error) {
      showNotification('Error al realizar la operación', 'error');
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        {notification && (
          <div className={`fixed top-4 right-4 p-4 rounded-md ${
            notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          } text-white`}>
            {notification.message}
          </div>
        )}

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
          handleRemoveTeam={(teamId) => handleTeamAction(handleRemoveTeam, teamId)}
          handleRemovePlayer={(teamId, playerId) => handleTeamAction(handleRemovePlayer, teamId, playerId)}
          handleEditTeam={handleEditTeam}
        />

        <div className="mt-8 flex justify-center items-center space-x-4">
          <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span>Página {pagination.page} de {Math.ceil(pagination.total / pagination.pageSize)}</span>
          <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <AddTeamModal
          open={isModalOpen}
          onClose={closeModal}
          onSubmit={(team) => handleTeamAction(editingTeam ? handleUpdateTeam : handleAddTeam, team)}
          editingTeam={editingTeam}
        />

        <ConfirmModal isOpen={confirmModal.isOpen} onClose={closeConfirmModal} />
      </div>
    </div>
  );
}
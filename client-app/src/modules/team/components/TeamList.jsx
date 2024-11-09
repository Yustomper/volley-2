import React, { useState } from 'react';
import { PencilIcon, TrashIcon } from 'lucide-react';
import EquiposSkeleton from './TeamSkeleton';
import { useTheme } from '../../../context/ThemeContext';
import { PiGenderFemaleFill, PiGenderMaleFill } from 'react-icons/pi';
import ConfirmModal from './ConfirmModal';

export default function TeamList({ teams, loading, handleRemoveTeam, handleRemovePlayer, handleEditTeam }) {
  const { isDarkMode } = useTheme();
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: null,
    itemId: null
  });

  const openConfirmModal = (type, id, name) => {
    const modalConfig = {
      teamDeletion: {
        title: 'Eliminar Equipo',
        message: `¿Estás seguro de que deseas eliminar el equipo "${name}"? Esta acción no se puede deshacer.`,
        onConfirm: () => {
          handleRemoveTeam(id);
          closeConfirmModal();
        }
      },
      playerDeletion: {
        title: 'Eliminar Jugador',
        message: `¿Estás seguro de que deseas eliminar al jugador "${name}" del equipo? Esta acción no se puede deshacer.`,
        onConfirm: () => {
          handleRemovePlayer(id, confirmModal.itemId);
          closeConfirmModal();
        }
      }
    };

    setConfirmModal({
      isOpen: true,
      ...modalConfig[type],
      type,
      itemId: id
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null,
      type: null,
      itemId: null
    });
  };

  if (loading) {
    return <EquiposSkeleton />;
  }

  if (teams.length === 0) {
    return <p className="col-span-3 text-center text-gray-500">No hay equipos disponibles.</p>;
  }

  return (
    <>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teams.map((team) => (
          <div key={team.id} className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-purple-400' : 'text-orange-600'}`}>
                {team.name}
              </h3>
              {team.gender === 'F' ? (
                <PiGenderFemaleFill className="text-pink-500 text-3xl" />
              ) : (
                <PiGenderMaleFill className="text-blue-500 text-3xl" />
              )}
            </div>

            <div className="mb-4">
              <p className="text-sm font-medium">
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Entrenador: </span>{team.coach}
              </p>
              <p className="text-sm">
                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Staff: </span>{team.staff}
              </p>
            </div>

            <ul className="space-y-3">
              {team.players
                .filter(player => player.is_starter)
                .map((player) => (
                  <li key={player.id} className={`flex items-center justify-between space-x-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-lg`}>
                    <div className="flex items-center space-x-3">
                      <img
                        src={player.avatar || '/api/placeholder/40/40'}
                        alt={player.name}
                        className="w-10 h-10 rounded-full border-2 border-orange-500"
                      />
                      <span className={isDarkMode ? 'text-gray-200' : 'text-gray-800'}>{player.name}</span>
                      <span className={isDarkMode ? 'text-purple-400' : 'text-orange-500'}>#{player.jersey_number}</span>
                    </div>
                    <button
                      onClick={() => openConfirmModal('playerDeletion', team.id, player.name)}
                      className={`${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-purple-600 hover:text-purple-700'} transition duration-300`}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </li>
                ))}
            </ul>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => handleEditTeam(team)}
                className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-purple-600 hover:text-purple-700'} transition duration-300`}
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => openConfirmModal('teamDeletion', team.id, team.name)}
                className={`${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-purple-600 hover:text-purple-700'} transition duration-300`}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
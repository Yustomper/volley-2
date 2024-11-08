// client-app/src/modules/team/components/TeamList.jsx
import React from 'react';
import { PencilIcon, TrashIcon } from 'lucide-react';
import EquiposSkeleton from './TeamSkeleton';
import { useTheme } from '../../../context/ThemeContext';
import { PiGenderFemaleFill, PiGenderMaleFill } from 'react-icons/pi';

export default function TeamList({ teams, loading, handleRemoveTeam, handleRemovePlayer, handleEditTeam }) {
  const { isDarkMode } = useTheme();

  if (loading) {
    return <EquiposSkeleton />;
  }

  if (teams.length === 0) {
    return <p className="col-span-3 text-center text-gray-500">No hay equipos disponibles.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {teams.map((team) => (
        <div key={team.id} className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-purple-400' : 'text-orange-600'}`}>
              {team.name}
            </h3>
            {/* Ícono de género del equipo */}
            {team.gender === 'F' ? (
              <PiGenderFemaleFill className="text-pink-500 text-3xl" />
            ) : (
              <PiGenderMaleFill className="text-blue-500 text-3xl" />
            )}
          </div>

          {/* Información del entrenador y staff */}
          <div className="mb-4">
            <p className="text-sm font-medium">
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Entrenador: </span>{team.coach}
            </p>
            <p className="text-sm">
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Staff: </span>{team.staff}
            </p>
          </div>

          {/* Mostrar solo jugadores titulares (is_starter = true) */}
          <ul className="space-y-3">
            {team.players
              .filter(player => player.is_starter) // Filtrar jugadores titulares
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
                    onClick={() => handleRemovePlayer(team.id, player.id)}
                    className={`${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-purple-600 hover:text-purple-700'} transition duration-300`}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </li>
              ))}
          </ul>

          <div className="mt-6 flex justify-end space-x-2">
            {/* Botones de edición y eliminación de equipo */}
            <button
              onClick={() => handleEditTeam(team)}
              className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-purple-600 hover:text-purple-700'} transition duration-300`}
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleRemoveTeam(team.id)}
              className={`${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-purple-600 hover:text-purple-700'} transition duration-300`}
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

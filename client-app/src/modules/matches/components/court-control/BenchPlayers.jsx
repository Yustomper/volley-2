import React from 'react';
import { PiUserSwitchThin } from "react-icons/pi";
import { useTheme } from '../../../../context/ThemeContext';

const BenchPlayers = ({ team, players, onPlayerSwitch }) => {
  const { isDarkMode } = useTheme();

  if (!players || players.length === 0) {
    return (
      <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        No hay jugadores en banca
      </div>
    );
  }

  return (
    <div>
      <h4 className={`text-lg font-semibold mb-4 ${
        isDarkMode ? 'text-purple-400' : 'text-orange-600'
      }`}>
        Jugadores en Banca
      </h4>
      
      <div className="grid grid-cols-2 gap-4">
        {players.map(player => (
          <div 
            key={player.id}
            className={`${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' 
                : 'bg-white border-gray-200 hover:bg-gray-50'
            } rounded-xl p-4 flex justify-between items-center border shadow-md transition-all duration-200`}
          >
            <div className="flex items-center space-x-3">
              <div className={`${
                isDarkMode 
                  ? 'bg-gray-700 text-purple-400 border-purple-500' 
                  : 'bg-orange-100 text-orange-600 border-orange-300'
                } rounded-full w-10 h-10 flex items-center justify-center border-2`}>
                <span className="text-lg font-bold">
                  #{player.jersey_number}
                </span>
              </div>
              
              <div>
                <div className={`font-medium ${
                  isDarkMode ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {player.name}
                </div>
                <div className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {player.position}
                </div>
              </div>
            </div>

            <button
              onClick={() => onPlayerSwitch(team, null, player.id)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isDarkMode 
                  ? 'text-blue-400 hover:bg-gray-700 hover:text-blue-300' 
                  : 'text-purple-600 hover:bg-purple-100'
              }`}
              title="Realizar Cambio"
            >
              <PiUserSwitchThin className="w-6 h-6" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BenchPlayers;
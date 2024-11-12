// PlayerSwitchModal.jsx
import React from 'react';
import { useTheme } from '../../../../context/ThemeContext';

const PlayerSwitchModal = ({ 
  open, 
  onClose, 
  benchPlayer, 
  onConfirmSwitch, 
  starters  // Cambiado de positions a starters para mayor claridad
}) => {
  const { isDarkMode } = useTheme();

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md mx-4`}>
        <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-purple-400' : 'text-orange-600'}`}>
          Seleccionar Jugador para Intercambiar
        </h3>
        
        <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Jugador seleccionado: <span className="font-semibold">{benchPlayer?.name}</span>
        </p>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {starters.map((player, index) => (
            <div
              key={player.id}
              onClick={() => onConfirmSwitch(player)}
              className={`${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-50 hover:bg-gray-100'
              } p-4 rounded-lg cursor-pointer transition-colors duration-200`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`${
                    isDarkMode
                      ? 'bg-gray-600 text-purple-400 border-purple-500'
                      : 'bg-orange-100 text-orange-600 border-orange-300'
                    } rounded-full w-10 h-10 flex items-center justify-center border-2`}>
                    <span className="text-lg font-bold">#{player.jersey_number}</span>
                  </div>
                  
                  <div>
                    <div className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {player.name}
                    </div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {player.position}
                    </div>
                  </div>
                </div>

                <div className={`text-xs px-2 py-1 rounded ${
                  isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-600'
                }`}>
                  Titular
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerSwitchModal;
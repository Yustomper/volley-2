import React, { useState } from 'react';
import { MdControlPoint } from "react-icons/md";
import { PiUserSwitchThin } from "react-icons/pi";
import { useTheme } from '../../../../context/ThemeContext';
import PointTypeModal from './PointTypeModal';

const PlayerPosition = ({
  position,
  index,
  team,
  isMatchStarted,
  onPositionClick,
  onPlayerSwitch,
  onPointScored,
}) => {
  const { isDarkMode } = useTheme();
  const [showPointModal, setShowPointModal] = useState(false);

  const handlePointTypeSelect = (pointType) => {
    if (typeof onPointScored !== 'function') {
      console.error('onPointScored no es una función');
      return;
    }
    onPointScored(team, position?.id, pointType);
    setShowPointModal(false);
  };

  return (
    <>
      <div className={`relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-4 w-32 h-36 flex flex-col transition-all duration-200 transform hover:scale-105`}>
        {position ? (
          <>
            <div className="flex justify-between w-full items-center mb-2">
              <span className={`text-xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-orange-600'}`}>
                #{position.jersey_number}
              </span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {position.position}
              </span>
            </div>
            
            <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} truncate mb-2`}>
              {position.name}
            </div>
            
            <div className="flex space-x-2 mt-auto">
              <button
                onClick={() => setShowPointModal(true)}
                className={`p-2 ${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'} text-white rounded-lg transition-colors duration-200`}
                title="Anotar Punto"
              >
                <MdControlPoint className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPlayerSwitch(team, index, position.id)}
                className={`p-2 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-lg transition-colors duration-200`}
                title="Cambio de Jugador"
              >
                <PiUserSwitchThin className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <span className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Posición Vacía
            </span>
          </div>
        )}
      </div>

      <PointTypeModal
        open={showPointModal}
        onClose={() => setShowPointModal(false)}
        onPointTypeSelect={handlePointTypeSelect}
      />
    </>
  );
};

export default PlayerPosition;
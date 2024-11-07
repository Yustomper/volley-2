import React, { useState } from 'react';
import { MdControlPoint } from "react-icons/md";
import { PiUserSwitchThin } from "react-icons/pi";
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
  const [showPointModal, setShowPointModal] = useState(false);

  const handlePointTypeSelect = (pointType) => {
    if (typeof onPointScored !== 'function') {
      console.error('onPointScored no es una función');
      return;
    }
    onPointScored(team, position?.id, pointType);
    setShowPointModal(false);
  };

  // Muestra la información del jugador en una tarjeta
  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 w-32 h-36 flex flex-col items-center">
        <div className="flex justify-between w-full items-center mb-1">
          <span className="text-lg font-bold text-gray-800">
            {position?.jersey_number || '?'}
          </span>
          <span className="text-xs text-gray-500">
            {position?.position || '-'}
          </span>
        </div>
        
        <div className="text-sm font-medium sm:text-xl text-gray-700 truncate mb-2">
          {position?.name || 'Vacío'}
        </div>
        
        <div className="flex space-x-2 mt-auto">
          <button
            onClick={() => setShowPointModal(true)}
            className="p-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
            title="Anotar Punto"
          >
            <MdControlPoint className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPlayerSwitch(team, index, position?.id)}
            className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            title="Cambio de Jugador"
          >
            <PiUserSwitchThin className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal para seleccionar el tipo de punto */}
      <PointTypeModal
        open={showPointModal}
        onClose={() => setShowPointModal(false)}
        onPointTypeSelect={handlePointTypeSelect}
      />
    </>
  );
};

export default PlayerPosition;

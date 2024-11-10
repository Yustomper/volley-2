import React from 'react';
import PlayerPosition from './court-control/PlayerPosition' // Asegúrate de que la ruta sea correcta
import BenchPlayers from './court-control/BenchPlayers';
import { RotateCcw } from 'lucide-react';

const CourtControl = ({
  team,
  teamName,
  score = 0,
  positions = [],
  players = [],
  isMatchStarted = false,
  onPositionClick,
  onPlayerSwitch,
  onPointScored,
  onScoreDecrement
}) => {
  // Asegurarnos de que tenemos un array de 6 posiciones
  const validPositions = Array.isArray(positions) ? 
    positions.slice(0, 6) : Array(6).fill(null);

  // Rellenar el array hasta tener 6 posiciones si es necesario
  while (validPositions.length < 6) {
    validPositions.push(null);
  }

  // Debug para ver los datos que llegan
  console.log(`${team} positions:`, validPositions);
  console.log(`${team} players:`, players);

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-lg p-6 space-y-6">
      {/* Sección de Puntaje del Equipo */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800">{teamName}</h3>
        <div className="text-3xl font-bold text-gray-800">{score}</div>
      </div>

      {/* Área de la Cancha */}
      <div className="relative bg-green-100 p-6 rounded-lg aspect-[4/3.2] w-full max-w-lg mx-auto">
        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white transform -translate-x-1/2" />
        <div className="absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dashed border-gray-400 transform -translate-y-1/2" />
        
        <div className="relative w-full h-full grid gap-y-8">
          {/* Posiciones Delanteras */}
          <div className="grid grid-cols-3 gap-x-6">
            {validPositions.slice(0, 3).map((position, idx) => (
              <PlayerPosition
                key={`${team}-front-${idx}`}
                position={position}
                index={idx}
                team={team}
                isMatchStarted={isMatchStarted}
                onPositionClick={onPositionClick}
                onPlayerSwitch={onPlayerSwitch}
                onPointScored={onPointScored}
              />
            ))}
          </div>

          {/* Posiciones Traseras */}
          <div className="grid grid-cols-3 gap-x-6">
            {validPositions.slice(3, 6).map((position, idx) => (
              <PlayerPosition
                key={`${team}-back-${idx}`}
                position={position}
                index={idx + 3}
                team={team}
                isMatchStarted={isMatchStarted}
                onPositionClick={onPositionClick}
                onPlayerSwitch={onPlayerSwitch}
                onPointScored={onPointScored}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Botón de Revertir */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => onScoreDecrement(team)}
          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors duration-200"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Revertir
        </button>
      </div>

      {/* Jugadores en Banca */}
      <div className="border-t pt-4 mt-4">
        <BenchPlayers 
          team={team} 
          players={players.filter(p => !p.is_holding)}
          onPlayerSwitch={onPlayerSwitch} 
        />
      </div>
    </div>
  );
};

export default CourtControl;
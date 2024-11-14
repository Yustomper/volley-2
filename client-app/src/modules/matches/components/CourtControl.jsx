import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import PlayerPosition from './court-control/PlayerPosition';
import BenchPlayers from './court-control/BenchPlayers';
import { toast } from 'react-toastify';

const CourtControl = ({
  team,
  teamName,
  score = 0,
  positions = [],
  players = [],
  isMatchStarted = false,
  onPlayerSwitch,
  matchId,
  onPointScored,
  onScoreDecrement
}) => {
  const { isDarkMode } = useTheme();
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  // Filtra jugadores titulares y de banca
  const starterPlayers = positions.filter(pos => pos !== null);
  const benchPlayers = players.filter(player =>
    !starterPlayers.some(starter => starter.id === player.id)
  );

  console.log('Titulares en CourtControl:', starterPlayers);
  console.log('Jugadores en banca:', benchPlayers);

  const validPositions = Array.isArray(positions) ?
    positions.slice(0, 6) : Array(6).fill(null);

  while (validPositions.length < 6) {
    validPositions.push(null);
  }

  const handlePlayerSwitch = async (substitutionData) => {
    try {
      setIsLoadingAction(true);
      console.log('Datos de sustitución recibidos en CourtControl:', substitutionData);
      await matchesService.substitutePlayer(matchId, substitutionData); // Utiliza matchId directamente
      // Recargar los datos del partido después de la sustitución
      // (puedes agregar una función para esto)
    } catch (error) {
      console.error('Error en el cambio:', error);
      toast.error('Error al realizar el cambio');
    } finally {
      setIsLoadingAction(false);
    }
  };

  return (
    <div className={`w-full max-w-lg mx-auto ${isDarkMode ? 'bg-gray-800/50' : 'bg-white'} backdrop-blur-sm rounded-xl p-6 shadow-xl`}>
      {/* Header del Equipo */}
      <div className="text-center mb-6">
        <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-orange-600'}`}>
          {teamName}
        </h3>
        <div className={`text-5xl font-black mt-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          {score}
        </div>
      </div>

      {/* Área de la Cancha */}
      <div className={`relative ${isDarkMode ? 'bg-green-900/20' : 'bg-green-100'} p-6 rounded-xl aspect-[4/3.2] 
                    border ${isDarkMode ? 'border-green-500/30' : 'border-green-200'} shadow-lg`}>
        {/* Líneas de la cancha */}
        <div className={`absolute inset-y-0 left-1/2 w-0.5 ${isDarkMode ? 'bg-white/20' : 'bg-white'} transform -translate-x-1/2`} />
        <div className={`absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dashed 
                      ${isDarkMode ? 'border-white/20' : 'border-white'} transform -translate-y-1/2`} />

        {/* Grid de Jugadores */}
        <div className="relative w-full h-full grid gap-y-8">
          {/* Delanteros */}
          <div className="grid grid-cols-3 gap-x-6">
            {validPositions.slice(0, 3).map((position, idx) => (
              <PlayerPosition
                key={`${team}-front-${idx}`}
                position={position}
                index={idx}
                team={team}
                isMatchStarted={isMatchStarted}
                onPointScored={onPointScored}
              />
            ))}
          </div>

          {/* Zagueros */}
          <div className="grid grid-cols-3 gap-x-6">
            {validPositions.slice(3).map((position, idx) => (
              <PlayerPosition
                key={`${team}-back-${idx}`}
                position={position}
                index={idx + 3}
                team={team}
                isMatchStarted={isMatchStarted}
                onPointScored={onPointScored}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Botón de Revertir */}
      {isMatchStarted && score > 0 && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => onScoreDecrement(team)}
            className={`flex items-center px-6 py-3 ${isDarkMode
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-red-500 hover:bg-red-600'
              } text-white rounded-xl font-medium transform hover:scale-105 
            transition-all duration-300 shadow-lg`}
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Revertir Último Punto
          </button>
        </div>
      )}

      {/* Jugadores en Banca */}
      <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <BenchPlayers
          team={team}
          players={players}
          starters={starterPlayers}
          onPlayerSwitch={handlePlayerSwitch}
          isLoading={isLoadingAction}
          positions={validPositions}
          matchId={matchId} // Pasa el matchId como prop
        />
      </div>
    </div>
  );
};

export default CourtControl;
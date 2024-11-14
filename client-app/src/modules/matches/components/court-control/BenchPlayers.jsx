import React, { useState } from 'react';
import { PiUserSwitchThin } from "react-icons/pi";
import { useTheme } from '../../../../context/ThemeContext';
import { toast } from 'react-toastify';
import PlayerSwitchModal from './PlayerSwitchModal';
import matchesService from '../../../matches/services/matchesService';

const BenchPlayers = ({ team, players, starters, onPlayerSwitch, isLoading, positions, matchId }) => {
  const { isDarkMode } = useTheme();
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedStarter, setSelectedStarter] = useState(null);

  // Filtrar jugadores que NO están en las posiciones actuales
  const benchPlayers = players.filter(player => 
    !positions.some(pos => pos?.id === player.id)
  );

  console.log('Jugadores titulares en BenchPlayers:', positions.filter(pos => pos !== null));
  console.log('Jugadores en banca:', benchPlayers);

  const handlePlayerSwitchClick = (player) => {
    console.log('Jugador de banca seleccionado:', player);
    setSelectedPlayer(player);
    setModalOpen(true);
  };

  const handleConfirmSwitch = (starter) => {
    console.log('Jugador titular seleccionado:', starter);
    setSelectedStarter(starter);
    setModalOpen(false);
    setShowConfirmation(true);
  };

  const executeSwitch = async () => {
    try {
      if (!selectedPlayer?.id || !selectedStarter?.id) {
        toast.error('Error: Selecciona ambos jugadores para realizar el cambio');
        return;
      }
  
      const substitutionData = {
        team: team === 'home' ? 'A' : 'B',
        player_in: selectedPlayer.id,
        player_out: selectedStarter.id
      };
  
      console.log('Enviando datos para sustitución:', substitutionData);
      
      await matchesService.substitutePlayer(matchId, substitutionData);
      toast.success('Cambio solicitado con éxito');
      
      
      // Limpiar estados
      setShowConfirmation(false);
      setSelectedPlayer(null);
      setSelectedStarter(null);
    } catch (error) {
      console.error('Error en el cambio:', error);
      toast.error('Error al realizar el cambio');
    }
  };

  if (!benchPlayers || benchPlayers.length === 0) {
    return (
      <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        No hay jugadores en banca
      </div>
    );
  }

  return (
    <>
      <div>
        <h4 className={`text-lg font-semibold mb-4 ${
          isDarkMode ? 'text-purple-400' : 'text-orange-600'
        }`}>
          Jugadores en Banca
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          {benchPlayers.map(player => (
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
                onClick={() => handlePlayerSwitchClick(player)}
                disabled={isLoading}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'text-blue-400 hover:bg-gray-700 hover:text-blue-300' 
                    : 'text-purple-600 hover:bg-purple-100'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Realizar Cambio"
              >
                <PiUserSwitchThin className="w-6 h-6" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de selección de jugador titular */}
      <PlayerSwitchModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        benchPlayer={selectedPlayer}
        starters={positions.filter(pos => pos !== null)}
        onConfirmSwitch={handleConfirmSwitch}
      />

      {/* Modal de confirmación */}
      {showConfirmation && selectedPlayer && selectedStarter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 w-full max-w-md mx-4`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-purple-400' : 'text-orange-600'}`}>
              Confirmar Cambio
            </h3>
            
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              ¿Estás seguro de que deseas intercambiar a{' '}
              <span className="font-semibold">{selectedPlayer.name}</span> por{' '}
              <span className="font-semibold">{selectedStarter.name}</span>?
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setSelectedPlayer(null);
                  setSelectedStarter(null);
                }}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={executeSwitch}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-green-500 hover:bg-green-600'
                } text-white ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Confirmar Cambio
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BenchPlayers;
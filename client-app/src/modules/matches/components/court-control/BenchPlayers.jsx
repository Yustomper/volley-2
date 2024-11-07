import React from 'react';
import { PiUserSwitchThin } from "react-icons/pi";

const BenchPlayers = ({ team, players, onPlayerSwitch }) => {
  return (
    <div>
      <h4 className="text-lg font-semibold mb-4 text-gray-700">Jugadores en Banca</h4>
      <div className="grid grid-cols-2 gap-4">
        {players.map(player => (
          <div 
            key={player.id}
            className="bg-gray-50 rounded-lg p-3 flex justify-between items-center border border-gray-200"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-700">
                  {player.jersey_number}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{player.name}</div>
                <div className="text-xs text-gray-500">{player.position}</div>
              </div>
            </div>
            <button
              onClick={() => onPlayerSwitch(team, null, player.id)}
              className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
              title="Realizar Cambio"
            >
              <PiUserSwitchThin className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BenchPlayers;

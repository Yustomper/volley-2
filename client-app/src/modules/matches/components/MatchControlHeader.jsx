import React from 'react';
import { formatDuration } from '../utils/format';
import { useTheme } from '../../../context/ThemeContext'; // Ajusta la ruta según tu estructura

const MatchControlHeader = ({ match, currentSet, currentSetDuration, homeSetsWon, awaySetsWon }) => {
  const { isDarkMode } = useTheme();

  return (
    <>
      {/* Header del partido */}
      <div className="text-center mb-8">
        <h1 className={`text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text`}>
          {match.home_team.name} vs {match.away_team.name}
        </h1>
        <div className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} 
                        font-medium backdrop-blur-sm rounded-lg px-4 py-2 inline-block
                        ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
          Set actual: {currentSet} | Tiempo del set: {formatDuration(currentSetDuration)}
        </div>
      </div>

      {/* Marcador de sets */}
      <div className="flex justify-center items-center space-x-16 mb-8">
        <div className="text-center transform transition-transform hover:scale-105">
          <div className={`text-6xl font-black ${
            isDarkMode 
              ? 'text-purple-400 drop-shadow-glow' 
              : 'text-orange-600'
          }`}>
            {homeSetsWon}
          </div>
          <div className={`text-lg font-medium mt-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {match.home_team.name}
          </div>
        </div>

        <div className={`text-4xl font-bold ${
          isDarkMode ? 'text-gray-500' : 'text-gray-400'
        }`}>
          VS
        </div>

        <div className="text-center transform transition-transform hover:scale-105">
          <div className={`text-6xl font-black ${
            isDarkMode 
              ? 'text-purple-400 drop-shadow-glow' 
              : 'text-orange-600'
          }`}>
            {awaySetsWon}
          </div>
          <div className={`text-lg font-medium mt-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {match.away_team.name}
          </div>
        </div>
      </div>
    </>
  );
};

export default MatchControlHeader;
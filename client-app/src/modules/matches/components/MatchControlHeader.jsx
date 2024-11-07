// MatchHeader.jsx
import React from 'react';
import { formatDuration } from '../utils/formatDuration';

const MatchControlHeader = ({ match, currentSet, currentSetDuration, homeSetsWon, awaySetsWon }) => {
  return (
    <>
      {/* Header del partido */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {match.home_team.name} vs {match.away_team.name}
        </h1>
        <div className="mt-2 text-gray-600">
          Set actual: {currentSet} | Tiempo del set: {formatDuration(currentSetDuration)}
        </div>
      </div>

      {/* Marcador de sets */}
      <div className="flex justify-center items-center space-x-16 mb-8">
        <div className="text-center">
          <div className="text-6xl font-bold text-gray-800">{homeSetsWon}</div>
          <div className="text-sm text-gray-600 mt-2">{match.home_team.name}</div>
        </div>
        <div className="text-4xl font-bold text-gray-400">VS</div>
        <div className="text-center">
          <div className="text-6xl font-bold text-gray-800">{awaySetsWon}</div>
          <div className="text-sm text-gray-600 mt-2">{match.away_team.name}</div>
        </div>
      </div>
    </>
  );
};

export default MatchControlHeader;
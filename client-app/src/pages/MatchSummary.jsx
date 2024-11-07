import React from 'react';

const MatchSummary = () => {
  const matchSummaries = [
    { id: 1, team1: 'Equipo A', team2: 'Equipo B', score: '3-2', winner: 'Equipo A' },
    { id: 2, team1: 'Equipo C', team2: 'Equipo D', score: '0-3', winner: 'Equipo D' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
          Resumen de Partidos
        </h1>
        <div className="grid gap-6">
          {matchSummaries.map((match) => (
            <div key={match.id} className="bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-primary">{match.team1}</span>
                <span className="text-lg text-gray-400">{match.score}</span>
                <span className="text-xl font-semibold text-secondary">{match.team2}</span>
              </div>
              <div className="mt-4 text-gray-300">
                <p>Ganador: {match.winner}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchSummary;
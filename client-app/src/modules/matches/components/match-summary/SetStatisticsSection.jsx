import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChartBar } from 'lucide-react';

const SetStatisticsSection = ({ sets, matchId }) => {
  const navigate = useNavigate();

  if (!sets || sets.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        No hay sets disponibles para este partido
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold">Resultados por Set</h2>
      </div>
      <div className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">Set</th>
                <th scope="col" className="px-6 py-3">Equipo A</th>
                <th scope="col" className="px-6 py-3">Equipo B</th>
              </tr>
            </thead>
            <tbody>
              {sets.map((set) => (
                <tr key={set.set_number} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-6 py-4 font-medium">{set.set_number}</td>
                  <td className="px-6 py-4">{set.team_a_points}</td>
                  <td className="px-6 py-4">{set.team_b_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => navigate(`/match-results/${matchId}`)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
          >
            <ChartBar size={20} />
            Ver Detalles Completos
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetStatisticsSection;
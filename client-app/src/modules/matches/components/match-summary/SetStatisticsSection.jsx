// client-app/src/modules/matches/components/match-summary/SetStatisticsSection.jsx

import React from 'react';

const SetStatisticsSection = ({ sets }) => {
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
      </div>
    </div>
  );
};

export default SetStatisticsSection;

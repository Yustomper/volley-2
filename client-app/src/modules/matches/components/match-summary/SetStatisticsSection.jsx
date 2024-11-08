
// client-app/src/modules/matches/components/match-summary/SetStatisticsSection.jsx
import React from 'react'
import { Trophy, CircleDot, Medal } from 'lucide-react'

const PlayerStatsCard = ({ player, title, icon }) => {
  // Si no hay jugador, no renderizamos la tarjeta
  if (!player) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold">{player.name || 'Sin datos'}</div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {player.team ? `${player.team} - ${player.score} puntos` : 'Información no disponible'}
        </p>
      </div>
    </div>
  )
}

export default function SetStatisticsSection({ statistics }) {
  // Validación principal de statistics
  if (!statistics) return null

  // Verificar la existencia de best_scorer y best_server
  const hasScorerStats = statistics.best_scorer && Object.keys(statistics.best_scorer).length > 0
  const hasServerStats = statistics.best_server && Object.keys(statistics.best_server).length > 0
  const hasSets = statistics.sets && statistics.sets.length > 0

  return (
    <div className="space-y-8">
      {/* Solo mostrar la grid si hay al menos una estadística */}
      {(hasScorerStats || hasServerStats) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hasScorerStats && (
            <PlayerStatsCard
              player={statistics.best_scorer}
              title="Mejor Anotador"
              icon={<Medal className="h-4 w-4 text-orange-500" />}
            />
          )}
          {hasServerStats && (
            <PlayerStatsCard
              player={statistics.best_server}
              title="Mejor Sacador"
              icon={<Trophy className="h-4 w-4 text-yellow-500" />}
            />
          )}
        </div>
      )}

      {hasSets && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center">
              <CircleDot className="mr-2 h-6 w-6 text-blue-500" />
              Resultados por Set
            </h2>
          </div>
          <div className="p-4">
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3">Set</th>
                    <th scope="col" className="px-6 py-3">
                      {statistics.sets[0]?.home_team_name || 'Local'}
                    </th>
                    <th scope="col" className="px-6 py-3">
                      {statistics.sets[0]?.away_team_name || 'Visitante'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.sets.map((set) => (
                    <tr key={set.set_number} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                      <td className="px-6 py-4 font-medium">{set.set_number}</td>
                      <td className="px-6 py-4">{set.home_team_score}</td>
                      <td className="px-6 py-4">{set.away_team_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay estadísticas */}
      {!hasScorerStats && !hasServerStats && !hasSets && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No hay estadísticas disponibles para este partido
        </div>
      )}
    </div>
  )
}
// client-app/src/modules/matches/components/match-summary/TeamShowSection.jsx

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit, Trash, Play, RefreshCcw } from 'lucide-react'
import WeatherDisplay from './WeatherDisplay'

const TeamShowSection = ({ 
  match, 
  isEditing, 
  editedMatch, 
  onInputChange, 
  onLocationChange,
  onLocationSelect, 
  locations,
  onRefreshWeather,
  onEdit,
  onDelete
}) => {
  const navigate = useNavigate()

  const handleStartMatch = () => {
    navigate(`/volleyball/${match.id}`)
  }

  if (isEditing) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="space-y-4 p-6">
          <div>
            <label 
              htmlFor="date" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Fecha y Hora
            </label>
            <input
              id="date"
              type="datetime-local"
              name="date"
              value={editedMatch.date}
              onChange={onInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="relative">
            <label 
              htmlFor="location" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Ubicación
            </label>
            <input
              id="location"
              type="text"
              name="location"
              value={editedMatch.location}
              onChange={onLocationChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 
                       focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {locations.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg">
                {locations.map(location => (
                  <div
                    key={location.id || `${location.latitude}-${location.longitude}`}
                    onClick={() => onLocationSelect(location)}
                    className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {location.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="p-6">
        <div className="flex justify-end space-x-2 mb-4">
          <button 
            onClick={onEdit}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 
                     dark:hover:bg-gray-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button 
            onClick={onDelete}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 
                     dark:hover:bg-gray-700 transition-colors"
          >
            <Trash className="h-4 w-4" />
          </button>
          <button 
            onClick={handleStartMatch}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white 
                     flex items-center transition-colors"
          >
            <Play className="h-4 w-4 mr-2" /> Iniciar Partido
          </button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="text-center w-1/3">
            <h2 className="text-3xl font-bold">{match.home_team.name}</h2>
          </div>
          <div className="text-center w-1/3">
            <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">VS</div>
            <p className="text-lg">
              {new Date(match.date).toLocaleString()}
            </p>
            <p className="text-lg mb-2">{match.location}</p>
          </div>
          <div className="text-center w-1/3">
            <h2 className="text-3xl font-bold">{match.away_team.name}</h2>
          </div>
        </div>

        {match.weather && (
          <div className="flex justify-center">
            <WeatherDisplay 
              weather={{
                condition: match.weather.condition,
                temperature: match.weather.temperature
              }} 
              onRefresh={onRefreshWeather}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default TeamShowSection
import React from 'react'
import { useParams } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { Loader2 } from 'lucide-react'
import TeamShowSection from './match-summary/TeamShowSection'
import SetStatisticsSection from './match-summary/SetStatisticsSection'
import EditMatchForm from './match-summary/EditMatchForm'
import useMatchDetails from '../hooks/useMatchDetails'
import useMatchEdit from '../hooks/useMatchEdit'
import api from '../services/matchesService'

export default function MatchSummary() {
  const { matchId } = useParams()
  const { enqueueSnackbar } = useSnackbar()
  const { match, loading, error, fetchMatchDetails } = useMatchDetails(matchId)
  const { 
    isEditing, 
    editedMatch, 
    handleEdit, 
    handleSaveEdit, 
    handleCancelEdit, 
    handleDelete, 
    handleStartMatch,
    handleInputChange,
    handleLocationSelect,
    locations
  } = useMatchEdit(match, fetchMatchDetails)

  const handleRefreshWeather = async () => {
    if (!match.latitude || !match.longitude) {
      enqueueSnackbar('No se pueden obtener las coordenadas del partido', { variant: 'warning' })
      return
    }
    try {
      const weatherData = await api.getWeather(match.latitude, match.longitude, match.date)
      await api.updateMatchWeather(match.id, weatherData)
      await fetchMatchDetails()
      enqueueSnackbar('Clima actualizado con éxito', { variant: 'success' })
    } catch (error) {
      console.error('Error updating weather:', error)
      enqueueSnackbar('Error al actualizar el clima', { variant: 'error' })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl mt-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {match && (
          <>
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg mb-8">
              <div className="p-6">
                <TeamShowSection 
                  match={match}
                  isEditing={isEditing}
                  editedMatch={editedMatch}
                  onInputChange={handleInputChange}
                  onLocationChange={handleInputChange}
                  onLocationSelect={handleLocationSelect}
                  locations={locations}
                  onRefreshWeather={handleRefreshWeather}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
                {isEditing && (
                  <EditMatchForm 
                    editedMatch={editedMatch}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                    onInputChange={handleInputChange}
                  />
                )}
              </div>
            </div>
            {match.statistics && <SetStatisticsSection statistics={match.statistics} />}
          </>
        )}
      </div>
    </div>
  )
}
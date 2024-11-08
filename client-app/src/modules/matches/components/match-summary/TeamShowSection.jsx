// client-app/src/modules/matches/components/match-summary/TeamShowSection.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiPlay } from 'react-icons/fi';
import WeatherDisplay from './WeatherDisplay';
import matchesApi from '../../services/matchesService';
import { toast } from 'react-toastify';
import EditMatchForm from './EditMatchForm';

const TeamShowSection = ({ match, weather, refreshMatchData }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedMatch, setEditedMatch] = useState(match);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleStartMatch = () => {
    navigate(`/volleyball/${match.id}`);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedMatch({ ...match });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedMatch((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSaveEdit = async () => {
    try {
      await matchesApi.updateMatch(editedMatch.id, {
        tournament_id: editedMatch.tournament.id || editedMatch.tournament,
        team_a_id: editedMatch.team_a.id || editedMatch.team_a,
        team_b_id: editedMatch.team_b.id || editedMatch.team_b,
        scheduled_date: `${editedMatch.scheduled_date}T${editedMatch.scheduled_time}`,
        location: editedMatch.location,
        latitude: editedMatch.latitude,
        longitude: editedMatch.longitude,
      });
      setIsEditing(false);
      refreshMatchData();
      toast.success('Partido actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar el partido:', error);
      toast.error('Error al actualizar el partido');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedMatch(match);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await matchesApi.deleteMatch(match.id);
      toast.success('Partido eliminado exitosamente');
      navigate('/matches');
    } catch (error) {
      console.error('Error al eliminar el partido:', error);
      toast.error('Error al eliminar el partido');
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-8">
      <div className="p-6">
        {isEditing ? (
          <EditMatchForm
            editedMatch={editedMatch}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
            onInputChange={handleInputChange}
          />
        ) : (
          <>
            <div className="flex justify-end space-x-2 mb-4">
              <button
                onClick={handleEdit}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FiEdit className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleStartMatch}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center transition-colors"
              >
                <FiPlay className="h-4 w-4 mr-2" /> Iniciar Partido
              </button>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="text-center w-1/3">
                <h2 className="text-3xl font-bold">{match.team_a.name}</h2>
              </div>
              <div className="text-center w-1/3">
                <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">VS</div>
                <p className="text-lg">
                  {new Date(match.scheduled_date).toLocaleString('es-ES', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                    timeZone: 'America/Santiago', // Ajusta según tu zona horaria
                    hour12: true,
                  })}
                </p>
                <p className="text-lg mb-2">{match.location}</p>
              </div>
              <div className="text-center w-1/3">
                <h2 className="text-3xl font-bold">{match.team_b.name}</h2>
              </div>
            </div>

            {weather && (
              <div className="flex justify-center">
                <WeatherDisplay weather={weather} />
              </div>
            )}
          </>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
            <p>¿Estás seguro de que deseas eliminar este partido?</p>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamShowSection;

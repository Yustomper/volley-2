import { useState, useEffect, useCallback } from 'react';
import api from '../services/matchesService';

const useMatchEdit = (match, onSaveSuccess) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMatch, setEditedMatch] = useState(null);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    if (match) {
      setEditedMatch({
        ...match,
        date: match.date ? match.date.split('.')[0] : ''
      });
    }
  }, [match]);

  const handleEdit = useCallback(() => setIsEditing(true), []);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditedMatch(match ? {
      ...match,
      date: match.date ? match.date.split('.')[0] : ''
    } : null);
    setLocations([]);
  }, [match]);

  const handleSaveEdit = useCallback(async () => {
    if (!editedMatch) return;
    try {
      await api.updateMatch(editedMatch.id, {
        ...editedMatch,
        home_team: editedMatch.home_team.id,
        away_team: editedMatch.away_team.id,
      });
      
      setIsEditing(false);
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (err) {
      console.error('Error al actualizar el partido:', err);
      // Manejar el error aquí
    }
  }, [editedMatch, onSaveSuccess]);

  const handleInputChange = useCallback(async (e) => {
    const { name, value } = e.target;
    
    setEditedMatch(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'location') {
      try {
        const results = await api.searchLocations(value);
        setLocations(results);
      } catch (err) {
        console.error('Error al buscar ubicaciones:', err);
      }
    }
  }, []);

  const handleLocationSelect = useCallback((location) => {
    setEditedMatch(prev => ({
      ...prev,
      location: location.name,
      latitude: location.latitude,
      longitude: location.longitude
    }));
    setLocations([]);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!match) return;
    if (window.confirm('¿Estás seguro de que quieres eliminar este partido?')) {
      try {
        await api.deleteMatch(match.id);
        // Redirigir al usuario o actualizar el estado global
      } catch (err) {
        console.error('Error al eliminar el partido:', err);
      }
    }
  }, [match]);

  const handleStartMatch = useCallback(() => {
    // Implementar la lógica para iniciar el partido
  }, []);

  return {
    isEditing,
    editedMatch,
    locations,
    handleEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDelete,
    handleStartMatch,
    handleInputChange,
    handleLocationSelect
  };
};

export default useMatchEdit;
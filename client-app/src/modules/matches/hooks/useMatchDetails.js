import { useState, useEffect } from 'react';
import api from '../services/matchesService';

const useMatchDetails = (matchId) => {
  const [state, setState] = useState({
    match: null,
    loading: true,
    error: null,
    weather: null,
    statistics: null
  });

  const fetchMatchDetails = async () => {
    if (!matchId) {
      setState(prev => ({
        ...prev,
        error: 'ID de partido no válido',
        loading: false
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Realizamos todas las peticiones en paralelo para mejorar el rendimiento
      const [matchResponse, statsResponse] = await Promise.all([
        api.getMatch(matchId),
        api.getMatchStatistics(matchId).catch(err => {
          console.warn('Error al cargar estadísticas:', err);
          return { data: null };
        })
      ]);

      const matchData = matchResponse.data;
      const statsData = statsResponse?.data;

      // Obtener el clima solo si tenemos las coordenadas necesarias
      let weatherData = null;
      if (matchData.latitude && matchData.longitude && matchData.date) {
        try {
          weatherData = await api.getWeather(
            matchData.latitude,
            matchData.longitude,
            matchData.date
          );
        } catch (weatherError) {
          console.warn('Error al obtener el clima:', weatherError);
        }
      }

      // Actualizamos el estado con toda la información recopilada
      setState(prev => ({
        ...prev,
        match: {
          ...matchData,
          statistics: statsData,
          weather: weatherData
        },
        statistics: statsData,
        weather: weatherData,
        loading: false,
        error: null
      }));

    } catch (error) {
      console.error('Error al cargar los detalles del partido:', error);
      setState(prev => ({
        ...prev,
        error: error.response?.data?.message || 
               error.response?.data?.error || 
               'Error al cargar la información del partido',
        loading: false
      }));
    }
  };

  const updateMatchWeather = async () => {
    if (!state.match?.latitude || !state.match?.longitude) {
      return { success: false, error: 'Coordenadas no disponibles' };
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const weatherData = await api.getWeather(
        state.match.latitude,
        state.match.longitude,
        state.match.date
      );

      // Actualizamos el estado con el nuevo clima
      setState(prev => ({
        ...prev,
        match: {
          ...prev.match,
          weather: weatherData
        },
        weather: weatherData,
        loading: false
      }));

      return { success: true, data: weatherData };
    } catch (error) {
      console.error('Error al actualizar el clima:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Error al actualizar el clima'
      }));
      return { success: false, error: error.message };
    }
  };

  const refreshMatchData = async () => {
    await fetchMatchDetails();
  };

  useEffect(() => {
    fetchMatchDetails();
  }, [matchId]);

  return {
    ...state,
    fetchMatchDetails,
    updateMatchWeather,
    refreshMatchData,
    isLoading: state.loading,
    hasError: !!state.error,
    errorMessage: state.error
  };
};

export default useMatchDetails;
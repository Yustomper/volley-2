// client-app/src/modules/matches/hooks/useMatchDetails.js

import { useState, useEffect } from 'react';
import matchesApi from '../services/matchesService';

const useMatchDetails = (matchId) => {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMatchDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await matchesApi.getMatch(matchId);
      setMatch(response.data);
    } catch (error) {
      console.error('Error al cargar los detalles del partido:', error);
      setError('Error al cargar la información del partido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (matchId) {
      fetchMatchDetails();
    }
  }, [matchId]);

  return {
    match,
    loading,
    error,
    refreshMatchData: fetchMatchDetails,
  };
};

export default useMatchDetails;

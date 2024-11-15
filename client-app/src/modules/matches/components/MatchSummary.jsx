// client-app/src/modules/matches/components/MatchSummary.jsx

import React, { useState, useEffect } from 'react';
import TeamShowSection from './match-summary/TeamShowSection';
import SetStatisticsSection from './match-summary/SetStatisticsSection';
import matchesApi from '../services/matchesService';
import { toast } from 'react-toastify';

const MatchSummary = ({ match, refreshMatchData }) => {
  const [weather, setWeather] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchWeather = async () => {
    if (!match.latitude || !match.longitude || !match.scheduled_date) {
      return;
    }
    try {
      const weatherData = await matchesApi.getWeather(
        match.latitude,
        match.longitude,
        match.scheduled_date
      );
      setWeather(weatherData);
    } catch (error) {
      console.error('Error al obtener el clima:', error);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [match]);


  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };


  return (
    <div>
      <TeamShowSection
        match={match}
        weather={match.weather_info}
        refreshMatchData={refreshMatchData}
        onEdit={toggleEdit}
      />
      <SetStatisticsSection
        matchId={match.id}
        sets={match.sets} />
    </div>
  );
};

export default MatchSummary;

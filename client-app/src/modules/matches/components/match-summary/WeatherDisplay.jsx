// client-app/src/modules/matches/components/match-summary/WeatherDisplay.jsx

import React from 'react';
import { FiRefreshCcw } from 'react-icons/fi';

const WeatherDisplay = ({ weather, onRefresh }) => {
  if (!weather) return null;

  const { temperature, weather_code } = weather;
  const weatherDescriptions = {
    0: 'Despejado',
    1: 'Principalmente despejado',
    2: 'Parcialmente nublado',
    3: 'Nublado',
    45: 'Niebla',
    48: 'Niebla depositante de escarcha',
    51: 'Llovizna ligera',
    53: 'Llovizna moderada',
    55: 'Llovizna densa',
    56: 'Llovizna helada ligera',
    57: 'Llovizna helada densa',
    61: 'Lluvia ligera',
    63: 'Lluvia moderada',
    65: 'Lluvia fuerte',
    66: 'Lluvia helada ligera',
    67: 'Lluvia helada fuerte',
    71: 'Nevada ligera',
    73: 'Nevada moderada',
    75: 'Nevada intensa',
    77: 'Granos de nieve',
    80: 'Chubascos ligeros',
    81: 'Chubascos moderados',
    82: 'Chubascos violentos',
    85: 'Chubascos de nieve ligeros',
    86: 'Chubascos de nieve intensos',
    95: 'Tormenta eléctrica',
    96: 'Tormenta con granizo ligero',
    99: 'Tormenta con granizo fuerte',
    // Puedes agregar más códigos de clima según la API
  };

  const description = weatherDescriptions[weather_code] || 'Clima desconocido';

  return (
    <div className="flex items-center justify-center space-x-4">
      <div className="text-2xl font-bold">{description}</div>
      <div className="text-2xl font-bold">{temperature}°C</div>
    </div>
  );
};

export default WeatherDisplay;

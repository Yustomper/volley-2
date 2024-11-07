import React from 'react';
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiDayThunderstorm } from 'react-icons/wi';
import { FiRefreshCw } from 'react-icons/fi';

const WeatherDisplay = ({ weather, onRefresh }) => {
  if (!weather) return null;

  const getWeatherIcon = (condition) => {
    const icons = {
      Clear: WiDaySunny,
      Cloudy: WiCloudy,
      Rainy: WiRain,
      Snowy: WiSnow,
      Stormy: WiDayThunderstorm
    };
    const IconComponent = icons[condition] || WiDaySunny;
    return <IconComponent className="text-4xl" />;
  };

  return (
    <div className="flex items-center justify-center">
      {getWeatherIcon(weather.condition)}
      <span className="ml-2">{weather.temperature}°C</span>
      <button onClick={onRefresh} className="ml-4 p-2 bg-blue-500 text-white rounded">
        <FiRefreshCw />
      </button>
    </div>
  );
};

export default WeatherDisplay;
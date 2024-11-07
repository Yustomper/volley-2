import axios from 'axios';

const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

export const weatherService = {
  async getWeather(latitude, longitude, date) {
    console.log('Iniciando getWeather con:', { latitude, longitude, date });
    
    try {
      // 1. Validación de entrada
      if (!latitude || !longitude) {
        throw new Error('Latitude y longitude son requeridos');
      }

      // 2. Conversión de tipos
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      
      console.log('Valores convertidos:', { lat, lon });

      // 3. Validación post-conversión
      if (isNaN(lat) || isNaN(lon)) {
        throw new Error(`Valores inválidos después de conversión: lat=${lat}, lon=${lon}`);
      }

      // 4. Formateo de fecha
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        throw new Error('Fecha inválida: ' + date);
      }
      
      const currentDate = new Date();
      const formattedDate = dateObj > currentDate ? currentDate.toISOString().split('T')[0] : dateObj.toISOString().split('T')[0];
      console.log('Fecha formateada:', formattedDate);

      // 5. Construcción de URL
      const params = {
        latitude: lat.toFixed(4),
        longitude: lon.toFixed(4),
        hourly: 'temperature_2m,weathercode',
        start_date: formattedDate,
        end_date: formattedDate,
        timezone: 'auto'
      };
      
      console.log('URL params:', params);
      
      // 6. Petición a la API
      const response = await axios.get(WEATHER_API, { params });
      
      // 7. Procesamiento de respuesta
      const hourlyData = response.data.hourly;
      const hour = dateObj.getHours();
      
      return {
        temperature: Math.round(hourlyData.temperature_2m[hour]),
        weatherCode: this.getWeatherCondition(hourlyData.weathercode[hour])
      };
    } catch (error) {
      // 8. Manejo de errores detallado
      if (error.response) {
        // Error de la API
        console.error('Error de la API del clima:', {
          status: error.response.status,
          data: error.response.data
        });
        throw new Error(`Error de la API del clima: ${error.response.status}`);
      } else if (error.request) {
        // Error de red
        console.error('Error de red:', error.request);
        throw new Error('No se pudo conectar con la API del clima');
      } else {
        // Error de validación u otro
        console.error('Error:', error.message);
        throw error;
      }
    }
  },

  getWeatherCondition(code) {
    if (code < 3) return "Clear";
    if (code < 50) return "Cloudy";
    if (code < 70) return "Rainy";
    if (code < 80) return "Snowy";
    return "Stormy";
  }
};
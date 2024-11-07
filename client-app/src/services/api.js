// src/services/api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_API;
const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';

// Función para crear una instancia de axios con el token
const createAxiosInstance = () => {
  const token = localStorage.getItem("token");
  return axios.create({
    baseURL: API_URL,
    headers: token ? { Authorization: `Token ${token}` } : {},
  });
};

const api = {

  getTeams: ({ page = 1, search = "", ordering = "name" } = {}) =>
    createAxiosInstance().get(`/api/teams/`, {
      params: {
        page,
        search,
        ordering,
      },
    }),

  
  getStatistics: () => axios.get(`${API_URL}/api/statistics/`),

  // Búsqueda de ubicaciones con geocodificación
  searchLocations: async (query) => {
    try {
      const response = await axios.get(GEOCODING_API, {
        params: {
          name: query,
          count: 5,
          language: 'es',
          format: 'json',
        },
      });
      return response.data.results || [];
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  },

  // Clima (solo como referencia)
  getWeather: async (location, date) => {
    try {
      const [lat, lon] = await getCoordinates(location);
      const response = await axios.get(
        "https://api.open-meteo.com/v1/forecast",
        {
          params: {
            latitude: lat,
            longitude: lon,
            hourly: "temperature_2m,weathercode",
            start_date: date.split("T")[0],
            end_date: date.split("T")[0],
          },
        }
      );

      const hour = new Date(date).getHours();
      const temperature = response.data.hourly.temperature_2m[hour];
      const weathercode = response.data.hourly.weathercode[hour];

      return {
        temperature,
        condition: getWeatherCondition(weathercode),
      };
    } catch (error) {
      console.error("Error fetching weather:", error);
      throw error;
    }
  },
};

async function getCoordinates(location) {
  // Coordenadas fijas para este ejemplo, puedes reemplazarlas por geocodificación real
  return [52.52, 13.41]; // Coordenadas de Berlín
}

function getWeatherCondition(code) {
  // Interpretación simplificada de los códigos meteorológicos
  if (code < 3) return "Clear";
  if (code < 50) return "Cloudy";
  if (code < 70) return "Rainy";
  return "Stormy";
}

export default api;

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../../context/ThemeContext'; // Contexto del tema (claro/oscuro)
import apiClima from '../../../../services/api';
import api from '../../services/matchesService';
import { PiGenderFemaleFill, PiGenderMaleFill } from 'react-icons/pi'; // Iconos de género
import Select from 'react-select';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import { IoClose } from "react-icons/io5";

const MatchFormModal = ({ open, onClose, onSubmit }) => {
  const { isDarkMode } = useTheme();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [match, setMatch] = useState({
    home_team_id: '',
    away_team_id: '',
    date: '',
    time: '',
    location: '',
    latitude: null,
    longitude: null, // Guardamos las coordenadas seleccionadas
  });

  useEffect(() => {
    if (open) fetchTeams(); 
  }, [open]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await api.getTeams();
      setTeams(response.data.results || []);
    } catch (error) {
      console.error('Error al cargar los equipos:', error);
      toast.error('Error al cargar los equipos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMatch({ ...match, [name]: value });

    if (name === 'location') {
      debouncedSearchLocations(value);
    }
  };

  const debouncedSearchLocations = debounce(async (query) => {
    if (query.length > 2) {
      const results = await apiClima.searchLocations(query);
      setLocations(results);
    } else {
      setLocations([]);
    }
  }, 300);

  const handleLocationSelect = (location) => {
    setMatch({
      ...match,
      location: location.name,  // Guardamos la ubicación seleccionada
      latitude: location.latitude,  // Guardamos latitud
      longitude: location.longitude,  // Guardamos longitud
    });
    setLocations([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const matchData = {
        ...match,
        date: `${match.date}T${match.time}`,  // Combinamos fecha y hora
      };
      delete matchData.time;
      await api.createMatch(matchData);  // Creamos el partido con las coordenadas
      toast.success('Partido creado exitosamente');
      onSubmit(); 
      onClose(); 
    } catch (error) {
      console.error('Error al crear el partido:', error);
      toast.error('Error al crear el partido');
    }
  };

  // Definición de las opciones para react-select con iconos
  const teamOptions = teams.map(team => ({
    value: team.id,
    label: (
      <div className="flex items-center">
        {team.gender === 'F' ? (
          <PiGenderFemaleFill className="text-pink-500 mr-2" />
        ) : (
          <PiGenderMaleFill className="text-blue-500 mr-2" />
        )}
        {team.name}
      </div>
    ),
  }));

// Estilos personalizados para react-select
const customStyles = {
  control: (base) => ({
    ...base,
    backgroundColor: isDarkMode ? 'rgb(55, 65, 81)' : 'rgb(243, 244, 246)',
    color: isDarkMode ? 'white' : 'black',
    borderColor: isDarkMode ? 'rgb(75, 85, 99)' : 'rgb(209, 213, 219)',
  }),
  singleValue: (base) => ({
    ...base,
    color: isDarkMode ? 'white' : 'black',  // Color del texto seleccionado
  }),
  input: (base) => ({
    ...base,
    color: isDarkMode ? 'white' : 'black',  // Color del texto que se escribe
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: isDarkMode ? 'rgb(55, 65, 81)' : 'white',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused
      ? isDarkMode
        ? 'rgb(75, 85, 99)'
        : 'rgb(229, 231, 235)'
      : 'transparent',
    color: isDarkMode ? 'white' : 'black',  // Color de las opciones
  }),
};


  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg w-full max-w-2xl`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-orange-600'}`}>Crear Partido</h1>
          <button onClick={onClose} className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}>
            <IoClose className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
            {/* Selección de Equipo Local con react-select */}
            <Select
              options={teamOptions}
              styles={customStyles}
              placeholder="Seleccionar Equipo Local"
              onChange={(selectedOption) => setMatch({ ...match, home_team_id: selectedOption.value })}
            />

            {/* Selección de Equipo Visitante con react-select */}
            <Select
              options={teamOptions}
              styles={customStyles}
              placeholder="Seleccionar Equipo Visitante"
              onChange={(selectedOption) => setMatch({ ...match, away_team_id: selectedOption.value })}
            />

            <input
              type="date"
              name="date"
              value={match.date}
              onChange={handleChange}
              className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
              required
            />

            <input
              type="time"
              name="time"
              value={match.time}
              onChange={handleChange}
              className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
              required
            />

            {/* Ubicación */}
            <div className="relative">
              <input
                type="text"
                name="location"
                value={match.location}
                onChange={handleChange}
                placeholder="Ubicación"
                className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}
                required
              />
              {locations.length > 0 && (
                <ul className={`absolute z-10 w-full mt-1 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  {locations.map((loc) => (
                    <li
                      key={`${loc.latitude}-${loc.longitude}`}
                      onClick={() => handleLocationSelect(loc)}
                      className={`p-2 cursor-pointer ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'}`}
                    >
                      {loc.name}, {loc.country}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <button
            type="submit"
            className={`mt-4 w-full p-2 rounded-lg ${isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-orange-500 hover:bg-orange-600'} text-white transition duration-300`}
          >
            Crear Partido
          </button>
        </form>
      </div>
    </div>
  );
};

export default MatchFormModal;

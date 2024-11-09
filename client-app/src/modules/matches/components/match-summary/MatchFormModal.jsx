import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../../context/ThemeContext'; // Contexto del tema (claro/oscuro)
import geoService from '../../../../services/geoService';
import matchesApi from '../../services/matchesService';
import teamApi from '../../../team/services/teamService';
import tournamentApi from '../../../tournament/services/tournamentService';
import { PiGenderFemaleFill, PiGenderMaleFill } from 'react-icons/pi'; // Iconos de género
import Select from 'react-select';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import { IoClose } from "react-icons/io5";

const MatchFormModal = ({ open, onClose, onSubmit }) => {
  const { isDarkMode } = useTheme();
  const [teams, setTeams] = useState([]);
  const [teamOptions, setTeamOptions] = useState([]); 
  const [teamBOptions, setTeamBOptions] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [tournamentOptions, setTournamentOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [match, setMatch] = useState({
    team_a: '',
    team_b: '',
    date: '',
    time: '',
    location: '',
    latitude: null,
    longitude: null,
  })

  useEffect(() => {
    if (open) 
    {
      fetchTeams(); 
    fetchTournaments();
  }
  }, [open]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamApi.getTeams();
      const allTeams = response.data.results || [];
      setTeams(allTeams);
      const options = buildTeamOptions(allTeams);
      setTeamOptions(options); 
      setTeamBOptions(options); 
    } catch (error) {
      console.error('Error al cargar los equipos:', error);
      toast.error('Error al cargar los equipos');
    } finally {
      setLoading(false);
    }
  };

  const fetchTournaments = async () => {
    try {
      const response = await tournamentApi.getTournaments();
      const allTournaments = response.data.results || [];
      setTournaments(allTournaments);
      const options = allTournaments.map(tournament => ({
        value: tournament.id,
        label: tournament.name,
      }));
      setTournamentOptions(options);
    } catch (error) {
      console.error('Error al cargar los torneos:', error);
      toast.error('Error al cargar los torneos');
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
      const results = await geoService.searchLocations(query); // Corrección aquí
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
      const scheduledDate = `${match.date}T${match.time}`;
      const matchData = {
        tournament_id: 1, 
        team_a_id: match.team_a,
        team_b_id: match.team_b,
        scheduled_date: scheduledDate,
        location: match.location,
        latitude: match.latitude,
        longitude: match.longitude,
      };

      console.log('Datos del partido:', matchData);
      await matchesApi.createMatch(matchData);
      toast.success('Partido creado exitosamente');
      onSubmit(); 
      onClose(); 
    } catch (error) {
      console.error('Error al crear el partido:', error);
      toast.error('Error al crear el partido');
    }
  };

  const buildTeamOptions = (teamList) => {
    return teamList.map(team => ({
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
      gender: team.gender, // Incluimos el género para filtrar después
    }));
  };
  
  const handleTeamAChange = (selectedOption) => {
    const selectedTeamAId = selectedOption.value;
    const selectedTeamAGender = teams.find(team => team.id === selectedTeamAId).gender;
  
    // Filtrar opciones de Equipo B
    const filteredTeamBOptions = teamOptions.filter(option => 
      option.gender === selectedTeamAGender && option.value !== selectedTeamAId
    );
  
    setTeamBOptions(filteredTeamBOptions);
  
    setMatch({ ...match, team_a: selectedTeamAId, team_b: '' }); // Reiniciar selección de Equipo B
  };

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
           {/* Selección de Torneo */}
           <Select
              options={tournamentOptions}
              styles={customStyles}
              placeholder="Seleccionar Torneo"
              onChange={(selectedOption) => setMatch({ ...match, tournament: selectedOption.value })}
              value={tournamentOptions.find(option => option.value === match.tournament) || null}
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
            {/* Selección de Equipo A */}
            <Select
              options={teamOptions}
              styles={customStyles}
              placeholder="Seleccionar Equipo A"
              onChange={handleTeamAChange}
              value={teamOptions.find(option => option.value === match.team_a) || null}
            />

            {/* Selección de Equipo B */}
            <Select
              options={teamBOptions}
              styles={customStyles}
              placeholder="Seleccionar Equipo B"
              onChange={(selectedOption) => setMatch({ ...match, team_b: selectedOption.value })}
              value={teamBOptions.find(option => option.value === match.team_b) || null}
              isDisabled={!match.team_a} // Deshabilitar hasta que se seleccione Equipo A
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

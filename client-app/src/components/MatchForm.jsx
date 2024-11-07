import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const MatchForm = ({ onAddMatch, teams }) => {
  const { isDarkMode } = useTheme();
  const [match, setMatch] = useState({
    team1: '',
    team2: '',
    date: '',
    time: '',
  });

  const handleChange = (e) => {
    setMatch({ ...match, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddMatch(match);
    setMatch({ team1: '', team2: '', date: '', time: '' });
  };

  return (
    <form onSubmit={handleSubmit} className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-pink-100'}`}>
      <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-purple-400' : 'text-pink-600'}`}>Agregar Partido</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          name="team1"
          value={match.team1}
          onChange={handleChange}
          className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-pink-800'}`}
          required
        >
          <option value="">Seleccionar Equipo 1</option>
          {teams.map(team => (
            <option key={team.id} value={team.name}>{team.name}</option>
          ))}
        </select>
        <select
          name="team2"
          value={match.team2}
          onChange={handleChange}
          className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-pink-800'}`}
          required
        >
          <option value="">Seleccionar Equipo 2</option>
          {teams.map(team => (
            <option key={team.id} value={team.name}>{team.name}</option>
          ))}
        </select>
        <input
          type="date"
          name="date"
          value={match.date}
          onChange={handleChange}
          className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-pink-800'}`}
          required
        />
        <input
          type="time"
          name="time"
          value={match.time}
          onChange={handleChange}
          className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-pink-800'}`}
          required
        />
      </div>
      <button
        type="submit"
        className={`mt-4 w-full p-2 rounded-lg ${isDarkMode ? 'bg-purple-500 hover:bg-purple-600' : 'bg-pink-500 hover:bg-pink-600'} text-white transition duration-300`}
      >
        Agregar Partido
      </button>
    </form>
  );
};

export default MatchForm;
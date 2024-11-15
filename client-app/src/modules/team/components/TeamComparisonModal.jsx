// src/modules/team/components/TeamComparisonModal.jsx
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { IoClose } from "react-icons/io5";
import { PiGenderFemaleFill, PiGenderMaleFill } from 'react-icons/pi';
import { toast } from 'react-toastify';
import teamApi from '../services/teamService';

const TeamComparisonModal = ({ open, onClose, onCompare, isDarkMode }) => {
  const [teams, setTeams] = useState([]);
  const [teamOptions, setTeamOptions] = useState([]);
  const [teamBOptions, setTeamBOptions] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState({
    team1: null,
    team2: null
  });

  useEffect(() => {
    if (open) {
      fetchTeams();
    }
  }, [open]);

  const fetchTeams = async () => {
    try {
      const response = await teamApi.getTeams();
      const allTeams = response.data.results || [];
      setTeams(allTeams);
      const options = buildTeamOptions(allTeams);
      setTeamOptions(options);
      setTeamBOptions(options);
    } catch (error) {
      console.error('Error al cargar los equipos:', error);
      toast.error('Error al cargar los equipos');
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
      gender: team.gender,
      name: team.name,
      original: team,
    }));
  };

  const handleTeam1Change = (selectedOption) => {
    const selectedTeam1Id = selectedOption.value;
    const selectedTeam1Gender = teams.find(team => team.id === selectedTeam1Id).gender;

    const filteredTeam2Options = teamOptions.filter(option =>
      option.gender === selectedTeam1Gender && option.value !== selectedTeam1Id
    );

    setTeamBOptions(filteredTeam2Options);
    setSelectedTeams({ ...selectedTeams, team1: selectedOption });
  };

  const handleCompare = () => {
    if (selectedTeams.team1 && selectedTeams.team2) {
      onCompare({
        team1: selectedTeams.team1.original,
        team2: selectedTeams.team2.original
      });
      onClose();
    }
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? 'rgb(55, 65, 81)' : 'rgb(243, 244, 246)',
      borderColor: isDarkMode ? 'rgb(75, 85, 99)' : 'rgb(209, 213, 219)',
    }),
    singleValue: (base) => ({
      ...base,
      color: isDarkMode ? 'white' : 'black',
    }),
    input: (base) => ({
      ...base,
      color: isDarkMode ? 'white' : 'black',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDarkMode ? 'rgb(55, 65, 81)' : 'white',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
        ? isDarkMode ? 'rgb(75, 85, 99)' : 'rgb(229, 231, 235)'
        : 'transparent',
      color: isDarkMode ? 'white' : 'black',
    }),
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg w-full max-w-2xl`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-orange-600'}`}>
            Comparar Equipos
          </h2>
          <button onClick={onClose} className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}>
            <IoClose className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Primer Equipo
            </label>
            <Select
              options={teamOptions}
              styles={customStyles}
              placeholder="Seleccionar Primer Equipo"
              onChange={handleTeam1Change}
              value={selectedTeams.team1}
            />
          </div>

          <div>
            <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Segundo Equipo
            </label>
            <Select
              options={teamBOptions}
              styles={customStyles}
              placeholder="Seleccionar Segundo Equipo"
              onChange={(option) => setSelectedTeams({ ...selectedTeams, team2: option })}
              value={selectedTeams.team2}
              isDisabled={!selectedTeams.team1}
            />
          </div>

          <button
            onClick={handleCompare}
            disabled={!selectedTeams.team1 || !selectedTeams.team2}
            className={`w-full p-3 rounded-lg ${
              isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-orange-500 hover:bg-orange-600'
            } text-white transition duration-300 ${
              (!selectedTeams.team1 || !selectedTeams.team2) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Analizar Equipos
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamComparisonModal;
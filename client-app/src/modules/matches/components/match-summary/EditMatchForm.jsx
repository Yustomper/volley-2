// client-app/src/modules/matches/components/match-summary/EditMatchForm.jsx

import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import Select from 'react-select';
import { PiGenderFemaleFill, PiGenderMaleFill } from 'react-icons/pi';
import teamApi from '../../../team/services/teamService';
import tournamentApi from '../../../tournament/services/tournamentService';

const EditMatchForm = ({ editedMatch, onSave, onCancel, onInputChange }) => {
  const [teams, setTeams] = useState([]);
  const [teamOptions, setTeamOptions] = useState([]);
  const [teamBOptions, setTeamBOptions] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [tournamentOptions, setTournamentOptions] = useState([]);

  useEffect(() => {
    fetchTeams();
    fetchTournaments();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await teamApi.getTeams();
      const allTeams = response.data.results || [];
      setTeams(allTeams);
      const options = buildTeamOptions(allTeams);
      setTeamOptions(options);

      // Filtrar opciones de Equipo B según el género del Equipo A seleccionado
      const selectedTeamAGender = allTeams.find(team => team.id === (editedMatch.team_a.id || editedMatch.team_a))?.gender;
      const filteredTeamBOptions = options.filter(option =>
        option.gender === selectedTeamAGender && option.value !== (editedMatch.team_a.id || editedMatch.team_a)
      );
      setTeamBOptions(filteredTeamBOptions);
    } catch (error) {
      console.error('Error al cargar los equipos:', error);
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
    }));
  };

  const handleTeamAChange = (selectedOption) => {
    const selectedTeamAId = selectedOption.value;
    const selectedTeamAGender = teamOptions.find(option => option.value === selectedTeamAId)?.gender;

    const filteredTeamBOptions = teamOptions.filter(option =>
      option.gender === selectedTeamAGender && option.value !== selectedTeamAId
    );
    setTeamBOptions(filteredTeamBOptions);

    onInputChange({
      target: {
        name: 'team_a',
        value: selectedTeamAId,
      },
    });

    // Reiniciar selección de Equipo B
    onInputChange({
      target: {
        name: 'team_b',
        value: '',
      },
    });
  };

  // Estilos personalizados para react-select
  const customStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: 'rgb(243, 244, 246)',
      color: 'black',
      borderColor: 'rgb(209, 213, 219)',
    }),
    singleValue: (base) => ({
      ...base,
      color: 'black',
    }),
    input: (base) => ({
      ...base,
      color: 'black',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'white',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? 'rgb(229, 231, 235)' : 'transparent',
      color: 'black',
    }),
  };

  return (
    <div className="space-y-4">
      {/* Selección de Torneo */}
      <Select
        options={tournamentOptions}
        styles={customStyles}
        placeholder="Seleccionar Torneo"
        onChange={(selectedOption) => onInputChange({ target: { name: 'tournament', value: selectedOption.value } })}
        value={tournamentOptions.find(option => option.value === (editedMatch.tournament.id || editedMatch.tournament)) || null}
      />

      {/* Selección de Equipo A */}
      <Select
        options={teamOptions}
        styles={customStyles}
        placeholder="Seleccionar Equipo A"
        onChange={handleTeamAChange}
        value={teamOptions.find(option => option.value === (editedMatch.team_a.id || editedMatch.team_a)) || null}
      />

      {/* Selección de Equipo B */}
      <Select
        options={teamBOptions}
        styles={customStyles}
        placeholder="Seleccionar Equipo B"
        onChange={(selectedOption) => onInputChange({ target: { name: 'team_b', value: selectedOption.value } })}
        value={teamBOptions.find(option => option.value === (editedMatch.team_b.id || editedMatch.team_b)) || null}
        isDisabled={!editedMatch.team_a}
      />

      {/* Fecha */}
      <input
        type="date"
        name="scheduled_date"
        value={editedMatch.scheduled_date.split('T')[0]}
        onChange={onInputChange}
        className="w-full p-2 rounded-lg bg-gray-100 text-gray-800"
      />

      {/* Hora */}
      <input
        type="time"
        name="scheduled_time"
        value={editedMatch.scheduled_date.split('T')[1]?.slice(0, 5) || ''}
        onChange={onInputChange}
        className="w-full p-2 rounded-lg bg-gray-100 text-gray-800"
      />

      {/* Ubicación */}
      <input
        type="text"
        name="location"
        value={editedMatch.location}
        onChange={onInputChange}
        className="w-full p-2 rounded-lg bg-gray-100 text-gray-800"
      />

      {/* Botones */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={onSave}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
        >
          <FaSave />
        </button>
        <button
          onClick={onCancel}
          className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition-colors"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default EditMatchForm;

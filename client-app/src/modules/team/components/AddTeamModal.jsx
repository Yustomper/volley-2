import React, { useState, useEffect } from 'react';
import { IoClose } from "react-icons/io5";
import { BsPersonFillAdd } from "react-icons/bs";
import { useTheme } from '../../../context/ThemeContext';
import { Switch } from '@headlessui/react';

const POSITION_OPTIONS = [
  { value: 'CE', label: 'Central' },
  { value: 'PR', label: 'Punta Receptor' },
  { value: 'AR', label: 'Armador' },
  { value: 'OP', label: 'Opuesto' },
  { value: 'LI', label: 'Líbero' },
];

const AddTeamModal = ({ open, onClose, onSubmit, editingTeam }) => {
  const { isDarkMode } = useTheme();
  const [teamName, setTeamName] = useState('');
  const [gender, setGender] = useState('M');
  const [players, setPlayers] = useState([{ name: '', jerseyNumber: '', position: '', isHolding: false }]);

  // Contar el número de jugadores titulares
  const titularCount = players.filter(player => player.isHolding).length;


  useEffect(() => {
    if (editingTeam) {
      setTeamName(editingTeam.name);
      setGender(editingTeam.gender || 'M');
      setPlayers(editingTeam.players.map(player => ({
        name: player.name,
        jerseyNumber: player.jersey_number,
        position: player.position || '',
        isHolding: player.is_holding || false,
      })));
    } else {
      setTeamName('');
      setGender('M');
      setPlayers([{ name: '', jerseyNumber: '', position: '', isHolding: false }]);
    }
  }, [editingTeam]);

  const handlePlayerChange = (index, field, value) => {
    const newPlayers = [...players];
    newPlayers[index][field] = value;
    setPlayers(newPlayers);
  };

  const handleAddPlayer = () => {
    if (players.length < 14) {
      setPlayers([...players, { name: '', jerseyNumber: '', position: '', isHolding: false }]);
    }
  };

  const handleRemovePlayer = (index) => {
    if (players.length > 6) {
      const newPlayers = players.filter((_, i) => i !== index);
      setPlayers(newPlayers);
    }
  };

  const handleSubmit = () => {
    if (teamName && players.length >= 6 && players.every(player => player.name && player.jerseyNumber)) {
      onSubmit({
        id: editingTeam?.id,
        name: teamName,
        gender,
        players: players.map(player => ({
          name: player.name,
          jersey_number: player.jerseyNumber,
          position: player.position,
          is_holding: player.isHolding,
        })),
      });
      onClose();
    } else {
      alert('Por favor, completa todos los campos obligatorios y asegúrate de tener al menos 6 jugadores');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-8 max-w-3xl w-full`}>
        
        {/* Título y género */}
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-pink-600'}`}>
            {editingTeam ? 'Editar Equipo' : 'Agregar Equipo'}
          </h2>

          <div className="flex items-center space-x-4">
            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Género del Equipo
            </label>

            <Switch
              checked={gender === 'F'}
              onChange={() => setGender(gender === 'M' ? 'F' : 'M')}
              className={`${gender === 'F' ? 'bg-pink-600' : 'bg-blue-600'} relative inline-flex h-6 w-11 items-center rounded-full transition`}
            >
              <span className="sr-only">Seleccionar género</span>
              <span className={`${gender === 'F' ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`} />
            </Switch>
            <span className={`ml-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {gender === 'F' ? 'Femenino' : 'Masculino'}
            </span>
          </div>

          <button onClick={onClose} className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-pink-500 hover:text-pink-700'}`}>
            <IoClose  className="h-6 w-6" />
          </button>
        </div>

        {/* Nombre del equipo */}
        <div className="mb-4">
          <label htmlFor="teamName" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Nombre del Equipo
          </label>
          <input
            id="teamName"
            type="text"
            placeholder="Ingrese el nombre del equipo"
            className={`w-full p-3 mt-1 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-pink-100 text-pink-800'} border ${isDarkMode ? 'border-gray-600' : 'border-pink-300'} rounded-lg focus:outline-none focus:border-purple-500`}
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
        </div>

        {/* Lista de jugadores con numeración y scroll */}
        <div className="max-h-72 overflow-y-auto mb-4">
          {players.map((player, index) => (
            <div key={index} className="mb-4">
              <div className="flex mb-4 items-center space-x-4">
                {/* Número del jugador (automático) */}
                <div className="w-1/12 text-center text-lg font-bold">
                  {index + 1}.
                </div>

                {/* Nombre del jugador */}
                <div className="w-1/3">
                  <label htmlFor={`playerName-${index}`} className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Nombre del Jugador
                  </label>
                  <input
                    id={`playerName-${index}`}
                    type="text"
                    placeholder="Nombre del jugador"
                    className={`w-full p-2 mt-1 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-pink-100 text-pink-800'} border ${isDarkMode ? 'border-gray-600' : 'border-pink-300'} rounded-lg focus:outline-none focus:border-purple-500`}
                    value={player.name}
                    onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                  />
                </div>

                {/* Número del jugador */}
                <div className="w-1/6">
                  <label htmlFor={`jerseyNumber-${index}`} className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Número
                  </label>
                  <input
                    id={`jerseyNumber-${index}`}
                    type="text"
                    placeholder="Número"
                    className={`w-full p-2 mt-1 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-pink-100 text-pink-800'} border ${isDarkMode ? 'border-gray-600' : 'border-pink-300'} rounded-lg focus:outline-none focus:border-purple-500`}
                    value={player.jerseyNumber}
                    onChange={(e) => handlePlayerChange(index, 'jerseyNumber', e.target.value)}
                  />
                </div>

                {/* Posición */}
                <div className="w-1/4">
                  <label htmlFor={`position-${index}`} className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Posición
                  </label>
                  <select
                    id={`position-${index}`}
                    value={player.position}
                    onChange={(e) => handlePlayerChange(index, 'position', e.target.value)}
                    className={`w-full p-2 mt-1 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-pink-100 text-pink-800'} border ${isDarkMode ? 'border-gray-600' : 'border-pink-300'} rounded-lg focus:outline-none focus:border-purple-500`}
                  >
                    <option value="">Posición</option>
                    {POSITION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                 {/* Switch para titular/reserva */}
                 <div className="w-1/6">
                  <label className={`mb-3 block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Titular
                  </label>
                  <Switch
                    checked={player.isHolding}
                    onChange={(checked) => {
                      if (!checked || titularCount < 6) {
                        handlePlayerChange(index, 'isHolding', checked);
                      } else {
                        alert('Solo puedes tener hasta 6 jugadores titulares.');
                      }
                    }}
                    className={`${player.isHolding ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition`}
                  >
                    <span className="sr-only">Titular</span>
                    <span className={`${player.isHolding ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`} />
                  </Switch>
                </div>

                {/* Botón para eliminar jugador */}
                <div className="w-1/12 flex items-center justify-center">
                  <button onClick={() => handleRemovePlayer(index)} className={`${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-pink-600 hover:text-pink-700'}`}>
                    <IoClose  className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botón para agregar jugador */}
        <button
          onClick={handleAddPlayer}
          className={`w-full p-2 mb-4 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-pink-500 hover:bg-pink-600'} text-white rounded-lg transition duration-300 flex items-center justify-center`}
          disabled={players.length >= 14}
        >
          <BsPersonFillAdd className="h-5 w-5 mr-2" />
          Agregar Jugador
        </button>

        {/* Botón para guardar o actualizar */}
        <button
          onClick={handleSubmit}
          className={`w-full p-3 ${isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-pink-600 hover:bg-pink-700'} text-white rounded-lg transition duration-300`}
        >
          {editingTeam ? 'Actualizar Equipo' : 'Guardar Equipo'}
        </button>
      </div>
    </div>
  );
};

export default AddTeamModal;

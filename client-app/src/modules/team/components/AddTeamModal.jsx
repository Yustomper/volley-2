// client-app/src/modules/team/components/AddTeamModal.jsx
import React, { useState, useEffect } from 'react';
import { IoClose, IoReloadOutline, IoCheckmarkOutline } from "react-icons/io5";
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

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Activo' },
  { value: 'Suspended', label: 'Suspendido' },
  { value: 'Injured', label: 'Lesionado' },
];
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4">
        <IoClose className="h-5 w-5" />
      </button>
    </div>
  );
};
const AddTeamModal = ({ open, onClose, onSubmit, editingTeam }) => {
  const { isDarkMode } = useTheme();
  const [teamName, setTeamName] = useState('');
  const [gender, setGender] = useState('M');
  const [coach, setCoach] = useState('');
  const [staff, setStaff] = useState('');
  const [players, setPlayers] = useState([{ name: '', jerseyNumber: '', position: '', is_starter: false, status: 'Active' }]);
  const [numberErrors, setNumberErrors] = useState({});
  const [toast, setToast] = useState(null);
  const titularCount = players.filter(player => player.is_starter).length;
  

  useEffect(() => {
    if (editingTeam) {
      setTeamName(editingTeam.name);
      setGender(editingTeam.gender || 'M');
      setCoach(editingTeam.coach || '');
      setStaff(editingTeam.staff || '');
      setPlayers(editingTeam.players.map(player => ({
        id: player.id,
        name: player.name,
        jerseyNumber: player.jersey_number,
        position: player.position || '',
        is_starter: player.is_starter || false,
        status: player.status || 'Active',
      })));
    } else {
      setTeamName('');
      setGender('M');
      setCoach('');
      setStaff('');
      setPlayers([{ name: '', jerseyNumber: '', position: '', is_starter: false, status: 'Active' }]);
    }
  }, [editingTeam]);

  const resetForm = () => {
    setTeamName('');
    setGender('M');
    setCoach('');
    setStaff('');
    setPlayers([{ name: '', jerseyNumber: '', position: '', is_starter: false, status: 'Active' }]);
    setNumberErrors({});
  };

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
  };

  const validateForm = () => {
    // Validar nombre del equipo
    if (!teamName.trim()) {
      showToast('El nombre del equipo es obligatorio');
      return false;
    }

    // Validar número mínimo de jugadores
    if (players.length < 6) {
      showToast('Debe haber al menos 6 jugadores en el equipo');
      return false;
    }

    // Validar titulares
    if (titularCount !== 6) {
      showToast('Debe haber exactamente 6 jugadores titulares');
      return false;
    }

    // Validar campos obligatorios y posiciones de titulares
    const hasInvalidPlayers = players.some((player, index) => {
      if (!player.name || !player.jerseyNumber) {
        showToast(`El jugador ${index + 1} tiene campos obligatorios vacíos`);
        return true;
      }
      if (player.is_starter && !player.position) {
        showToast(`El jugador titular ${index + 1} debe tener una posición asignada`);
        return true;
      }
      return false;
    });

    if (hasInvalidPlayers) return false;

    // Validar números de camiseta duplicados
    const jerseyNumbers = new Set();
    for (const player of players) {
      if (jerseyNumbers.has(player.jerseyNumber)) {
        showToast('Hay números de camiseta duplicados');
        return false;
      }
      jerseyNumbers.add(player.jerseyNumber);
    }

    return true;
  };

  const handlePlayerChange = (index, field, value) => {
    const newPlayers = [...players];

    // Limpiar error previo para este índice
    setNumberErrors(prev => ({ ...prev, [index]: null }));

    if (field === 'jerseyNumber') {
      // Si el valor está vacío, permitir borrar
      if (value === '' || value === null) {
        newPlayers[index][field] = '';
        setPlayers(newPlayers);
        return;
      }

      // Convertir a número y validar
      const numberValue = parseInt(value, 10);

      // Validar que sea positivo
      if (numberValue < 0) {
        showToast('El número debe ser positivo');
        return;
      }

      // Verificar si el número ya está en uso por otro jugador
      const isDuplicate = players.some(
        (player, playerIndex) =>
          playerIndex !== index &&
          player.jerseyNumber === numberValue &&
          player.jerseyNumber !== '' // Ignorar campos vacíos
      );

      if (isDuplicate) {
        showToast('Este número ya está en uso por otro jugador');
        return;
      }

      newPlayers[index][field] = numberValue;
    } else {
      // Para otros campos, mantener el comportamiento original
      newPlayers[index][field] = value;
    }

    setPlayers(newPlayers);
  };
  const handleAddPlayer = () => {
    if (players.length < 14) {
      setPlayers([...players, { name: '', jerseyNumber: '', position: '', is_starter: false, status: 'Active' }]);
    } else {
      showToast('No se pueden agregar más de 14 jugadores');
    }
  };

  const handleRemovePlayer = (index) => {
    if (players.length > 6) {
      const newPlayers = players.filter((_, i) => i !== index);
      setPlayers(newPlayers);
    } else {
      showToast('El equipo debe tener al menos 6 jugadores');
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        id: editingTeam?.id,
        name: teamName,
        gender,
        coach,
        staff,
        players: players.map(player => ({
          id: player.id,
          name: player.name,
          jersey_number: player.jerseyNumber,
          position: player.position,
          is_starter: player.is_starter,
          status: player.status,
        })),
      });
      showToast(editingTeam ? 'Equipo actualizado exitosamente' : 'Equipo creado exitosamente', 'success');
      onClose();
    }
  };

  
   
  if (!open) return null;

  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-8 max-w-6xl w-full`}>

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
            <IoClose className="h-6 w-6" />
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

        {/* Coach del equipo */}
        <div className="mb-4">
          <label htmlFor="coach" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Entrenador
          </label>
          <input
            id="coach"
            type="text"
            placeholder="Nombre del entrenador"
            className={`w-full p-3 mt-1 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-pink-100 text-pink-800'} border ${isDarkMode ? 'border-gray-600' : 'border-pink-300'} rounded-lg focus:outline-none focus:border-purple-500`}
            value={coach}
            onChange={(e) => setCoach(e.target.value)}
          />
        </div>

        {/* Staff del equipo */}
        <div className="mb-4">
          <label htmlFor="staff" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Staff
          </label>
          <input
            id="staff"
            type="text"
            placeholder="Ej: Asistente, Preparador físico, etc."
            className={`w-full p-3 mt-1 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-pink-100 text-pink-800'} border ${isDarkMode ? 'border-gray-600' : 'border-pink-300'} rounded-lg focus:outline-none focus:border-purple-500`}
            value={staff}
            onChange={(e) => setStaff(e.target.value)}
          />
        </div>

        {/* Lista de jugadores */}
        <div className="max-h-72 overflow-y-auto mb-4">
          {players.map((player, index) => (
            <div key={index} className="mb-4">
              <div className="flex mb-4 items-center space-x-4">
                <div className="w-1/12 text-center text-lg font-bold">
                  {index + 1}.
                </div>

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

                <div className="w-1/6">
                  <label htmlFor={`jerseyNumber-${index}`} className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Número
                  </label>
                  <div className="relative">
                    <input
                      id={`jerseyNumber-${index}`}
                      type="text"
                      placeholder="Número"
                      className={`w-full p-2 mt-1 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-pink-100 text-pink-800'
                        } border ${numberErrors[index]
                          ? 'border-red-500'
                          : isDarkMode
                            ? 'border-gray-600'
                            : 'border-pink-300'
                        } rounded-lg focus:outline-none ${numberErrors[index]
                          ? 'focus:border-red-500'
                          : 'focus:border-purple-500'
                        }`}
                      value={player.jerseyNumber}
                      onChange={(e) => handlePlayerChange(index, 'jerseyNumber', e.target.value)}
                    />
                    {numberErrors[index] && (
                      <p className="absolute text-xs text-red-500 mt-1">
                        {numberErrors[index]}
                      </p>
                    )}
                  </div>
                </div>

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

                <div className="w-20 flex flex-col items-center mb-2">
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Titular
                  </label>
                  <div className="mt-3"><Switch
                    checked={player.is_starter}
                    onChange={(checked) => {
                      if (!checked || titularCount < 6) {
                        handlePlayerChange(index, 'is_starter', checked);
                      } else {
                        alert('Solo puedes tener hasta 6 jugadores titulares.');
                      }
                    }}
                    className={`${player.is_starter ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition`}
                  >
                    <span className="sr-only">Titular</span>
                    <span className={`${player.is_starter ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`} />
                  </Switch>
                  </div>

                </div>

                <div className="w-1/4">
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Estado
                  </label>
                  <select
                    value={player.status}
                    onChange={(e) => handlePlayerChange(index, 'status', e.target.value)}
                    className={`w-full p-2 mt-1 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-pink-100 text-pink-800'} border ${isDarkMode ? 'border-gray-600' : 'border-pink-300'} rounded-lg focus:outline-none focus:border-purple-500`}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>



                <div className="w-1/12 flex items-center justify-center">
                  <button onClick={() => handleRemovePlayer(index)} className={`${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-pink-600 hover:text-pink-700'}`}>
                    <IoClose className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center space-y-4 mt-6">
          <button
            onClick={handleAddPlayer}
            className={`px-4 py-2 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-pink-500 hover:bg-pink-600'} text-white rounded-lg transition duration-300 flex items-center`}
            disabled={players.length >= 14}
          >
            <BsPersonFillAdd className="h-5 w-5 mr-2" />
            Agregar Jugador
          </button>

          <button
            onClick={handleSubmit}
            className={`px-6 py-2 ${isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-pink-600 hover:bg-pink-700'} text-white rounded-lg transition duration-300 flex items-center`}
          >
            {editingTeam ? (
              <>
                <span className="mr-2">Actualizar Equipo</span>
                <IoReloadOutline className="h-5 w-5" />
              </>
            ) : (
              <>
                <span className="mr-2">Guardar Equipo</span>
                <IoCheckmarkOutline className="h-5 w-5" />
              </>
            )}
          </button>
        </div>


      </div>
    

    </div>
  );
};

export default AddTeamModal;

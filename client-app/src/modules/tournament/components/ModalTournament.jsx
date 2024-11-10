import React, { useState, useEffect } from 'react';
import { IoClose } from "react-icons/io5";
import { MapPin, Calendar, Trophy, Pencil, Trash } from 'lucide-react';
import { useTheme } from "../../../context/ThemeContext";
import tournamentApi from '../services/tournamentService';

// Toast Component
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

// Delete Confirmation Dialog
const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm, tournamentName, isDarkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg p-6 max-w-sm w-full mx-4`}>
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-purple-400' : 'text-pink-600'}`}>
          Confirmar Eliminación
        </h2>
        <p className="mb-6">
          ¿Estás seguro de que deseas eliminar el torneo "{tournamentName}"? Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded ${isDarkMode ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} transition duration-300`}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white transition duration-300`}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

// ModalTournament Component
const ModalTournament = ({ open, onClose, onSubmit, editingTournament }) => {
  const { isDarkMode } = useTheme();
  const [toast, setToast] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    tournamentId: null,
    tournamentName: ''
  });

  const initialFormState = {
    id: null,
    name: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    teams: []
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (open) {
      fetchTournaments();
    }
  }, [open]);

  // Función para formatear las fechas en el formato yyyy-mm-dd
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  };

  // Definir fetchTournaments para cargar los torneos
  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const response = await tournamentApi.getTournaments();
      setTournaments(response.data.results || response.data);
    } catch (error) {
      showToast('Error al cargar los torneos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
        id: null,
        name: '',
        description: '',
        location: '',
        start_date: '',
        end_date: '',
        teams: []
    });
};

  const showToast = (message, type = 'error') => {
    setToast({ message, type });
  };

  const handleEdit = (tournament) => {
    try {
        setFormData({
            id: tournament.id,
            name: tournament.name || '',
            description: tournament.description || '',
            location: tournament.location || '',
            start_date: formatDateForInput(tournament.start_date),
            end_date: formatDateForInput(tournament.end_date),
            teams: tournament.teams || []
        });
    } catch (error) {
        showToast('Error al cargar los datos del torneo', 'error');
    }
};

  const handleDelete = (tournament) => {
    setDeleteConfirmation({
      isOpen: true,
      tournamentId: tournament.id,
      tournamentName: tournament.name
    });
  };

  const confirmDelete = async () => {
    try {
      await tournamentApi.deleteTournaments(deleteConfirmation.tournamentId);
      showToast('Torneo eliminado exitosamente', 'success');
      fetchTournaments();
    } catch (error) {
      showToast('Error al eliminar el torneo', 'error');
    } finally {
      setDeleteConfirmation({ isOpen: false, tournamentId: null, tournamentName: '' });
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showToast('El nombre del torneo es obligatorio');
      return false;
    }
    if (!formData.start_date) {
      showToast('La fecha de inicio es obligatoria');
      return false;
    }
    if (!formData.end_date) {
      showToast('La fecha de fin es obligatoria');
      return false;
    }

    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);

    if (endDate < startDate) {
      showToast('La fecha de fin no puede ser anterior a la fecha de inicio');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
        try {
            const submissionData = {
                name: formData.name,
                description: formData.description || '',
                location: formData.location || '',
                start_date: formData.start_date,
                end_date: formData.end_date,
                teams: formData.teams || []
            };

            if (formData.id) {
                await tournamentApi.updateTournaments(formData.id, submissionData);
                showToast('Torneo actualizado exitosamente', 'success');
            } else {
                await tournamentApi.createTournaments(submissionData);
                showToast('Torneo creado exitosamente', 'success');
            }
            
            await fetchTournaments(); // Primero actualizamos la lista
            resetForm(); // Luego reseteamos el formulario
            
        } catch (error) {
            showToast(error.response?.data?.message || 'Error al procesar el torneo', 'error');
        }
    }
};

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <DeleteConfirmDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, tournamentId: null, tournamentName: '' })}
        onConfirm={confirmDelete}
        tournamentName={deleteConfirmation.tournamentName}
        isDarkMode={isDarkMode}
      />

      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Trophy className={`h-8 w-8 ${isDarkMode ? 'text-purple-400' : 'text-pink-600'} mr-3`} />
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-pink-600'}`}>
              {formData.id ? 'Editar Torneo' : 'Crear Torneo'}
            </h2>
          </div>
          <button onClick={onClose} className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors`}>
            <IoClose className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className={`block mb-2 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Nombre del Torneo
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 ${
                  isDarkMode ? 'focus:ring-purple-400' : 'focus:ring-pink-600'
                }`}
                placeholder="Nombre del torneo"
              />
            </div>

            <div>
              <label className={`block mb-2 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 ${
                  isDarkMode ? 'focus:ring-purple-400' : 'focus:ring-pink-600'
                }`}
                rows="3"
                placeholder="Descripción del torneo"
              />
            </div>

            <div>
              <label className={`block mb-2 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Ubicación
              </label>
              <div className="relative">
                <MapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 ${
                    isDarkMode ? 'focus:ring-purple-400' : 'focus:ring-pink-600'
                  }`}
                  placeholder="Ubicación del torneo"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block mb-2 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Fecha de Inicio
                </label>
                <div className="relative">
                  <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 ${
                      isDarkMode ? 'focus:ring-purple-400' : 'focus:ring-pink-600'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block mb-2 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Fecha de Fin
                </label>
                <div className="relative">
                  <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 ${
                      isDarkMode ? 'focus:ring-purple-400' : 'focus:ring-pink-600'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} pt-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Torneos Existentes
            </h3>
            
            {loading ? (
              <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Cargando torneos...
              </div>
            ) : tournaments.length > 0 ? (
              <div className="space-y-4">
                {tournaments.map((tournament) => (
                  <div
                    key={tournament.id}
                    className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    } flex justify-between items-center`}
                  >
                    <div>
                      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {tournament.name}
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {tournament.start_date} - {tournament.end_date}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(tournament)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'hover:bg-gray-600 text-gray-400 hover:text-gray-200'
                            : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(tournament)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'hover:bg-gray-600 text-gray-400 hover:text-red-400'
                            : 'hover:bg-gray-200 text-gray-600 hover:text-red-600'
                        }`}
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No hay torneos creados
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-6 py-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-pink-600 hover:bg-pink-700 text-white'
              }`}
            >
              {formData.id ? 'Actualizar' : 'Crear'} Torneo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalTournament;
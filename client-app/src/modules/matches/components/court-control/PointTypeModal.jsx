import React from 'react';
import { useTheme } from '../../../../context/ThemeContext'; // Ajusta la ruta
import { X } from 'lucide-react'; // Para el icono de cerrar

const PointTypeModal = ({ open, onClose, onPointTypeSelect }) => {
  const { isDarkMode } = useTheme();

  if (!open) return null;

  const pointTypes = [
    { 
      id: 'SPK', 
      name: 'Remate', 
      color: isDarkMode ? 'bg-gradient-to-r from-blue-600 to-blue-800' : 'bg-gradient-to-r from-blue-500 to-blue-600',
      hoverEffect: 'hover:from-blue-700 hover:to-blue-900'
    },
    { 
      id: 'BLK', 
      name: 'Bloqueo', 
      color: isDarkMode ? 'bg-gradient-to-r from-green-600 to-green-800' : 'bg-gradient-to-r from-green-500 to-green-600',
      hoverEffect: 'hover:from-green-700 hover:to-green-900'
    },
    { 
      id: 'ACE', 
      name: 'Ace', 
      color: isDarkMode ? 'bg-gradient-to-r from-purple-600 to-purple-800' : 'bg-gradient-to-r from-purple-500 to-purple-600',
      hoverEffect: 'hover:from-purple-700 hover:to-purple-900'
    },
    { 
      id: 'ERR', 
      name: 'Error Rival', 
      color: isDarkMode ? 'bg-gradient-to-r from-yellow-600 to-yellow-800' : 'bg-gradient-to-r from-yellow-500 to-yellow-600',
      hoverEffect: 'hover:from-yellow-700 hover:to-yellow-900'
    }
  ];

  return (
    // Backdrop con efecto de desenfoque
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      {/* Modal Container */}
      <div className={`transform transition-all duration-300 scale-100
                      ${isDarkMode ? 'bg-gray-800' : 'bg-white'} 
                      rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl
                      border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-bold 
                         ${isDarkMode ? 'text-purple-400' : 'text-orange-600'}`}>
            Seleccionar tipo de punto
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded-full transition-colors
                       ${isDarkMode 
                         ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' 
                         : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid de botones */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {pointTypes.map(type => (
            <button
              key={type.id}
              onClick={() => onPointTypeSelect(type.id)}
              className={`${type.color} ${type.hoverEffect}
                         text-white py-4 px-4 rounded-xl
                         font-medium shadow-lg
                         transform transition-all duration-200
                         hover:scale-105 hover:shadow-xl
                         active:scale-95`}
            >
              {type.name}
            </button>
          ))}
        </div>

        {/* Botón de cancelar */}
        <button
          onClick={onClose}
          className={`w-full py-3 rounded-xl font-medium transition-all duration-200
                     transform hover:scale-105 active:scale-95
                     ${isDarkMode 
                       ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                       : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default PointTypeModal;
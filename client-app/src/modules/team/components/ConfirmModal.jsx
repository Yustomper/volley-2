import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  const { isDarkMode } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-lg p-6 max-w-sm w-full`}>
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-purple-400' : 'text-pink-600'}`}>{title}</h2>
        <p className="mb-6">{message || '¿Estás seguro de que deseas eliminar?'}</p> {/* Mensaje predeterminado */}
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
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

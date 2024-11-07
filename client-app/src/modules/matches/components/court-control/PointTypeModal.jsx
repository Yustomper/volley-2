// PointTypeModal.jsx
import React from 'react';

const PointTypeModal = ({ open, onClose, onPointTypeSelect }) => {
  if (!open) return null;

  const pointTypes = [
    { id: 'SPK', name: 'Remate', color: 'bg-blue-500' },
    { id: 'BLK', name: 'Bloqueo', color: 'bg-green-500' },
    { id: 'ACE', name: 'Ace', color: 'bg-purple-500' },
    { id: 'ERR', name: 'Error Rival', color: 'bg-yellow-500' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4">Seleccionar tipo de punto</h3>
        <div className="grid grid-cols-2 gap-4">
          {pointTypes.map(type => (
            <button
              key={type.id}
              onClick={() => onPointTypeSelect(type.id)}
              className={`${type.color} text-white py-3 px-4 rounded-lg hover:opacity-90 transition-opacity`}
            >
              {type.name}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default PointTypeModal;
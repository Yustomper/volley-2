import React from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';

const EditMatchForm = ({ editedMatch, onSave, onCancel, onInputChange }) => {
  return (
    <div className="space-y-4">
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
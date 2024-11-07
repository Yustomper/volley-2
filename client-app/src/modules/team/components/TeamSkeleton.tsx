import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

export default function EquiposSkeleton() {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className={`h-8 w-48 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-300'} rounded animate-pulse`}></div>
          <div className={`h-10 w-32 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-300'} rounded animate-pulse`}></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, index) => (
            <div key={index} className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`h-6 w-3/4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-4 animate-pulse`}></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, playerIndex) => (
                  <div key={playerIndex} className={`flex items-center space-x-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} p-2 rounded-lg animate-pulse`}>
                    <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                    <div className={`h-4 w-1/2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded`}></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function EstadisticasSkeleton() {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className={`h-10 w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded mx-auto mb-8 animate-pulse`}></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-purple-100'}`}>
              <div className={`h-6 w-1/2 ${isDarkMode ? 'bg-gray-700' : 'bg-purple-200'} rounded mb-4 animate-pulse`}></div>
              <div className={`h-10 w-3/4 ${isDarkMode ? 'bg-gray-700' : 'bg-purple-200'} rounded animate-pulse`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
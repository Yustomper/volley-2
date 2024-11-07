'use client'

import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function PartidosSkeleton() {
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
              <div className="flex justify-between items-center mb-4">
                <div className={`h-6 w-1/3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded animate-pulse`}></div>
                <div className={`h-6 w-1/3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded animate-pulse`}></div>
              </div>
              <div className={`h-4 w-2/3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-2 animate-pulse`}></div>
              <div className={`h-4 w-1/2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-4 animate-pulse`}></div>
              <div className={`h-8 w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded animate-pulse`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { AlertTriangle } from 'lucide-react';

const NotFound = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
    }`}>
      <div className={`max-w-md w-full p-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } rounded-lg shadow-xl`}>
        <div className="text-center">
          <AlertTriangle className={`mx-auto h-12 w-12 ${
            isDarkMode ? 'text-yellow-400' : 'text-yellow-500'
          }`} />
          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            404 - Página no encontrada
          </h1>
          <p className={`mt-2 text-base ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Lo sentimos, no pudimos encontrar la página que estás buscando.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                isDarkMode
                  ? 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500'
                  : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
              }`}
            >
              Volver a la página principal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
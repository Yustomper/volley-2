import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../modules/auth/context/AuthContext';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { token, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold mr-4">
              Volleyball App
            </Link>
            {token && (
              <span className="text-sm font-medium hidden md:inline">
                Bienvenido, {user?.username || 'Usuario'}
              </span>
            )}
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center">
            {token ? (
              <>
                <Link to="/team" className="px-3 py-2 rounded-md text-sm font-medium">Equipos</Link>
                <Link to="/matches" className="px-3 py-2 rounded-md text-sm font-medium">Partidos</Link>
                <Link to="/statistics" className="px-3 py-2 rounded-md text-sm font-medium">Estadísticas</Link>
                <button onClick={logout} className="px-3 py-2 rounded-md text-sm font-medium">Cerrar sesión</button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium">Iniciar sesión</Link>
                <Link to="/register" className="px-3 py-2 rounded-md text-sm font-medium">Registrarse</Link>
              </>
            )}
            <button onClick={toggleTheme} className="ml-4">
              {isDarkMode ? '🌞' : '🌙'}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleTheme} className="mr-2">
              {isDarkMode ? '🌞' : '🌙'}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-700 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {token && (
                <span className="block px-3 py-2 text-sm font-medium">
                  Bienvenido, {user?.username || 'Usuario'}
                </span>
              )}
              {token ? (
                <>
                  <Link to="/equipos" className="block px-3 py-2 rounded-md text-sm font-medium">Equipos</Link>
                  <Link to="/matches" className="block px-3 py-2 rounded-md text-sm font-medium">Partidos</Link>
                  <Link to="/statistics" className="block px-3 py-2 rounded-md text-sm font-medium">Estadísticas</Link>
                  <button onClick={logout} className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium">Cerrar sesión</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2 rounded-md text-sm font-medium">Iniciar sesión</Link>
                  <Link to="/register" className="block px-3 py-2 rounded-md text-sm font-medium">Registrarse</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
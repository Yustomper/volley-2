import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
          Dashboard
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/equipos" className="bg-gray-800 p-6 rounded-xl shadow-lg hover:bg-gray-700 transition duration-300">
            <h2 className="text-2xl font-semibold mb-4 text-primary">Equipos</h2>
            <p className="text-gray-300">Gestiona tus equipos y jugadores</p>
          </Link>
          <Link to="/partidos" className="bg-gray-800 p-6 rounded-xl shadow-lg hover:bg-gray-700 transition duration-300">
            <h2 className="text-2xl font-semibold mb-4 text-secondary">Partidos</h2>
            <p className="text-gray-300">Ver próximos partidos y resultados</p>
          </Link>
          <Link to="/estadisticas" className="bg-gray-800 p-6 rounded-xl shadow-lg hover:bg-gray-700 transition duration-300">
            <h2 className="text-2xl font-semibold mb-4 text-primary">Estadísticas</h2>
            <p className="text-gray-300">Analiza el rendimiento de los jugadores</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
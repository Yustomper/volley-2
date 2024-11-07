// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
  const { isDarkMode } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);

  const images = [
    '/images/volley1.jpg',
    '/images/volley2.png',
    '/images/volley3.jpg'
  ];

  // Cambio automático de imágenes cada 5 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
      
      {/* Encabezado con versiones para dark y light */}
      <header className={`w-full py-12 text-center ${isDarkMode ? 'bg-gradient-to-r from-purple-500 to-purple-800' : 'bg-gradient-to-r from-orange-500 to-orange-600'}`}>
        <h1 className="text-6xl font-extrabold text-white tracking-tight mb-4">
          Bienvenido a tu Plataforma de Voleibol
        </h1>
        <p className="text-lg text-white opacity-90">
          Gestiona equipos, organiza partidos y lleva tu pasión por el voleibol al siguiente nivel.
        </p>
      </header>

      {/* Sección de contenido principal */}
      <main className="flex-1 container mx-auto px-6 py-12">
        {/* Información sobre la plataforma */}
        <section className="grid md:grid-cols-2 gap-12 mb-16">
          <div className={`p-8 rounded-xl shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-purple-400' : 'text-orange-600'}`}>El deporte del Voleibol</h2>
            <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              El voleibol es una disciplina de equipo que promueve la cooperación, la estrategia y la velocidad. 
              En nuestra plataforma, te ofrecemos todas las herramientas necesarias para gestionar tus equipos y disfrutar del juego.
            </p>
          </div>
          <div className={`p-8 rounded-xl shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-purple-400' : 'text-orange-600'}`}>Crea y Gestiona tus Equipos</h2>
            <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Con nuestra plataforma, puedes crear, gestionar y llevar el control de tus equipos de voleibol, asignar jugadores, establecer posiciones, y mucho más.
              Prepárate para la acción dentro y fuera de la cancha.
            </p>
            <Link 
              to="/team" 
              className={`mt-4 inline-block px-6 py-3 rounded-full ${isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-orange-600 hover:bg-orange-700'} text-white font-semibold text-lg transition duration-300`}
            >
              Comienza a Gestionar tu Equipo
            </Link>
          </div>
        </section>

        {/* Carrusel de imágenes */}
        <section className="mb-16">
          <div className="relative w-full max-w-6xl mx-auto h-96 overflow-hidden rounded-lg shadow-xl">
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Volleyball ${index + 1}`}
                className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
              />
            ))}
          </div>
          {/* Indicadores del carrusel */}
          <div className="flex justify-center mt-4">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 mx-1 rounded-full ${
                  index === currentSlide ? (isDarkMode ? 'bg-purple-400' : 'bg-orange-600') : (isDarkMode ? 'bg-gray-600' : 'bg-gray-300')
                }`}
              />
            ))}
          </div>
        </section>

        {/* Llamado a la acción */}
        <section className="text-center">
          <h2 className={`text-4xl font-bold mb-8 ${isDarkMode ? 'text-purple-400' : 'text-orange-600'}`}>
            ¿Estás listo para organizar tu próximo partido?
          </h2>
          <Link 
            to="/matches" 
            className={`px-8 py-4 ${isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-orange-600 hover:bg-orange-700'} text-white font-semibold rounded-full text-lg transition duration-300`}
          >
            Crear Partido Ahora
          </Link>
        </section>
      </main>

      {/* Footer simple */}
      <footer className="py-8 text-center">
        <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-700'}`}>
          © 2024 Plataforma de Voleibol - Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
};

export default Home;

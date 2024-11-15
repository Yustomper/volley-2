import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2 } from 'lucide-react';
import TeamComparisonModal from '../modules/team/components/TeamComparisonModal';
import { useTheme } from '../context/ThemeContext';

const TeamPrediction = () => {
  const { isDarkMode } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);

  const generateRandomStats = (teams) => {
    const baseStats1 = Math.random() * 30 + 60;
    const baseStats2 = Math.random() * 30 + 60;

    return {
      teams: {
        team1: {
          ...teams.team1,
          winRate: Math.floor(baseStats1 + Math.random() * 10),
          totalMatches: Math.floor(Math.random() * 20 + 40),
          topScorer: {
            name: "Mejor Jugador",
            points: Math.floor(Math.random() * 100 + 180)
          },
          stats: {
            attack: Math.floor(baseStats1 + Math.random() * 15),
            defense: Math.floor(baseStats1 + Math.random() * 15),
            service: Math.floor(baseStats1 + Math.random() * 15),
            reception: Math.floor(baseStats1 + Math.random() * 15)
          }
        },
        team2: {
          ...teams.team2,
          winRate: Math.floor(baseStats2 + Math.random() * 10),
          totalMatches: Math.floor(Math.random() * 20 + 40),
          topScorer: {
            name: "Mejor Jugador",
            points: Math.floor(Math.random() * 100 + 180)
          },
          stats: {
            attack: Math.floor(baseStats2 + Math.random() * 15),
            defense: Math.floor(baseStats2 + Math.random() * 15),
            service: Math.floor(baseStats2 + Math.random() * 15),
            reception: Math.floor(baseStats2 + Math.random() * 15)
          }
        }
      },
      prediction: {
        team1: Math.floor((baseStats1 / (baseStats1 + baseStats2)) * 100),
        team2: 100 - Math.floor((baseStats1 / (baseStats1 + baseStats2)) * 100),
        factors: [
          { name: "Victorias recientes", advantage: baseStats1 > baseStats2 ? "team1" : "team2" },
          { name: "Eficiencia de ataque", advantage: Math.random() > 0.5 ? "team1" : "team2" },
          { name: "Defensa", advantage: Math.random() > 0.5 ? "team1" : "team2" },
          { name: "Experiencia", advantage: "neutral" }
        ]
      }
    };
  };

  const handleCompare = (selectedTeams) => {
    const stats = generateRandomStats(selectedTeams);
    setComparisonData(stats);
  };

  const StatBar = ({ value, color }) => (
    <div className="w-full bg-gray-700 rounded-full h-2">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );

  // Pantalla inicial
  if (!comparisonData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-orange-500 bg-clip-text text-transparent">
          Predicción de Encuentros
        </h1>
        <p className="text-gray-400 mb-8 text-center max-w-2xl">
          Selecciona dos equipos para obtener un análisis estadístico y una predicción
          basada en su rendimiento.
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600
                   text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition-all duration-300
                   hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
                   flex items-center gap-2"
        >
          <BarChart2 className="w-6 h-6" />
          <span>Comparar Equipos</span>
        </button>

        <TeamComparisonModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onCompare={handleCompare}
          isDarkMode={isDarkMode}
        />
      </div>
    );
  }

  // Visualización de la comparación
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-orange-500 bg-clip-text text-transparent">
            Análisis Predictivo
          </h1>
          <p className="text-gray-400 mt-2">Comparación estadística y predicción de rendimiento</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-8 mb-12">
          {/* Team 1 */}
          <div className="md:col-span-3 bg-gray-800 rounded-2xl p-6 shadow-xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-purple-400">{comparisonData.teams.team1.name}</h2>
              <div className="text-sm text-gray-400 mt-2">
                {comparisonData.teams.team1.totalMatches} partidos jugados
              </div>
            </div>
            <div className="space-y-4">
              {Object.entries(comparisonData.teams.team1.stats).map(([stat, value]) => (
                <div key={stat}>
                  <div className="flex justify-between mb-2">
                    <span className="capitalize">{stat}</span>
                    <span className="text-purple-400">{value}%</span>
                  </div>
                  <StatBar value={value} color="bg-purple-500" />
                </div>
              ))}
            </div>
          </div>

          {/* VS */}
          <div className="md:col-span-1 flex flex-col items-center justify-center">
            <div className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-orange-500 bg-clip-text text-transparent">
              VS
            </div>
          </div>

          {/* Team 2 */}
          <div className="md:col-span-3 bg-gray-800 rounded-2xl p-6 shadow-xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-orange-400">{comparisonData.teams.team2.name}</h2>
              <div className="text-sm text-gray-400 mt-2">
                {comparisonData.teams.team2.totalMatches} partidos jugados
              </div>
            </div>
            <div className="space-y-4">
              {Object.entries(comparisonData.teams.team2.stats).map(([stat, value]) => (
                <div key={stat}>
                  <div className="flex justify-between mb-2">
                    <span className="capitalize">{stat}</span>
                    <span className="text-orange-400">{value}%</span>
                  </div>
                  <StatBar value={value} color="bg-orange-500" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prediction Section */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Predicción de Victoria</h2>
          <div className="flex items-center justify-center mb-8">
            <div className="w-full max-w-3xl bg-gray-700 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${comparisonData.prediction.team1}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-purple-500 to-orange-500 relative"
              />
            </div>
          </div>
          <div className="flex justify-between text-xl font-bold">
            <span className="text-purple-400">{comparisonData.prediction.team1}%</span>
            <span className="text-orange-400">{comparisonData.prediction.team2}%</span>
          </div>
        </div>

        {/* Factores */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {comparisonData.prediction.factors.map((factor, index) => (
            <motion.div
              key={factor.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-3">{factor.name}</h3>
              <div className={`text-sm ${
                factor.advantage === 'team1' ? 'text-purple-400' :
                factor.advantage === 'team2' ? 'text-orange-400' :
                'text-gray-400'
              }`}>
                {factor.advantage === 'team1' ? '✓ Ventaja para ' + comparisonData.teams.team1.name :
                 factor.advantage === 'team2' ? '✓ Ventaja para ' + comparisonData.teams.team2.name :
                 '○ Sin ventaja clara'}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Botón para nueva comparación */}
        <div className="text-center">
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600
                     text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition-all duration-300
                     hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
                     flex items-center gap-2 mx-auto"
          >
            <BarChart2 className="w-6 h-6" />
            <span>Comparar Otros Equipos</span>
          </button>
        </div>
      </div>

      <TeamComparisonModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCompare={handleCompare}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default TeamPrediction;
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FaPlus, FaMinus, FaPlay, FaStop } from 'react-icons/fa';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import PointTypeModal from './PointTypeModal'; // Asegúrate de tener el componente modal

const VolleyballMatch = () => {
  const { isDarkMode } = useTheme();
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [homePositions, setHomePositions] = useState(Array(6).fill(''));
  const [awayPositions, setAwayPositions] = useState(Array(6).fill(''));
  const [isMatchStarted, setIsMatchStarted] = useState(false);
  const [matchDuration, setMatchDuration] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false); // Control del modal
  const [selectedTeam, setSelectedTeam] = useState(null); // Equipo seleccionado
  const [selectedPosition, setSelectedPosition] = useState(null); // Posición seleccionada
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        setLoading(true);
        const response = await api.getMatch(matchId);
  
        if (response && response.data) {
          const matchData = response.data;
          setMatch(matchData);
          console.log("Datos de match Fetch:", matchData);  // Verifica los datos de match y player_performances
          setIsMatchStarted(!!matchData.start_time);
  
          // Asignar automáticamente los nombres de los jugadores a las posiciones
          const homePlayerNames = matchData.home_team.players.map(player => player.name);
          const awayPlayerNames = matchData.away_team.players.map(player => player.name);
  
          setHomePositions(homePlayerNames);
          setAwayPositions(awayPlayerNames);
  
          console.log("Nombres de jugadores asignados a homePositions:", homePlayerNames);
          console.log("Nombres de jugadores asignados a awayPositions:", awayPlayerNames);
  
          if (matchData.start_time && !matchData.is_finished) {
            const startTime = new Date(matchData.start_time);
            const now = new Date();
            setMatchDuration(Math.floor((now - startTime) / 1000));
            startTimer();
          }
        } else {
          throw new Error('No se encontraron datos para el partido');
        }
      } catch (err) {
        setError('No se pudo cargar el partido');
      } finally {
        setLoading(false);
      }
    };
  
    fetchMatchDetails();
  }, [matchId]);
  

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setMatchDuration(prev => prev + 1);
    }, 1000);
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const incrementScore = async (team, pointType) => {
    const newScore = team === 'home' ? homeScore + 1 : awayScore + 1;
    if (team === 'home') {
      setHomeScore(newScore);
    } else {
      setAwayScore(newScore);
    }

    console.log("Datos enviados al backend: ", {
      set_number: currentSet,
      home_score: team === 'home' ? newScore : homeScore,
      away_score: team === 'away' ? newScore : awayScore,
      point_type: pointType
    });
    try {
      await api.updateMatchScore(matchId, {
        set_number: currentSet,
        home_score: team === 'home' ? newScore : homeScore,
        away_score: team === 'away' ? newScore : awayScore,
        point_type: pointType 
      });
      console.log("Datos enviados al backend: ", {
        set_number: currentSet,
        home_score: team === 'home' ? newScore : homeScore,
        away_score: team === 'away' ? newScore : awayScore,
        point_type: pointType
      });
      
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const decrementScore = async (team) => {
    const newScore = team === 'home' ? Math.max(0, homeScore - 1) : Math.max(0, awayScore - 1);
    if (team === 'home') {
      setHomeScore(newScore);
    } else {
      setAwayScore(newScore);
    }

    console.log("Datos enviados al backend en decremento:", {
      set_number: currentSet,
      home_score: team === 'home' ? newScore : homeScore,
      away_score: team === 'away' ? newScore : awayScore
    });

    try {
      await api.updateMatchScore(matchId, {
        set_number: currentSet,
        home_score: team === 'home' ? newScore : homeScore,
        away_score: team === 'away' ? newScore : awayScore
      });
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const handleEndSet = async () => {
    const winner = homeScore > awayScore ? 'home' : 'away';
    alert(`Set ${currentSet} ganado por ${winner === 'home' ? match.home_team.name : match.away_team.name}`);
    setCurrentSet(currentSet + 1);
    setHomeScore(0);
    setAwayScore(0);

    try {
      await api.updateMatchScore(matchId, {
        set_number: currentSet + 1,
        home_score: 0,
        away_score: 0
      });
    } catch (error) {
      console.error('Error starting new set:', error);
    }
  };

  const handleStartMatch = async () => {
    if (homePositions.includes('') || awayPositions.includes('')) {
      alert('Por favor, asigna todas las posiciones antes de iniciar el partido.');
      return;
    }
  
    console.log("Posiciones del equipo local:", homePositions);
    console.log("Posiciones del equipo visitante:", awayPositions);
    console.log("matchId:", matchId);  // Verificar que el matchId sea correcto
  
    try {
      const response = await api.startMatch(matchId);
      console.log("Respuesta del backend al iniciar el partido:", response.data);
      if (response.data.start_time) {
        setIsMatchStarted(true);
        setMatchDuration(0);
        startTimer();
      }
    } catch (error) {
      console.error('Error starting match:', error);
      alert('Error al iniciar el partido. Por favor, intenta de nuevo.');
    }
  };
  

  const handleEndMatch = async () => {
    const confirmed = window.confirm('¿Estás seguro de que deseas finalizar el partido?');
    if (confirmed) {
      try {
        await api.endMatch(matchId);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        console.log('Partido finalizado:', {
          homeTeam: match.home_team.name,
          awayTeam: match.away_team.name,
          homeScore,
          awayScore,
          currentSet,
          duration: formatDuration(matchDuration)
        });
        alert('El partido ha sido finalizado.');
      } catch (error) {
        console.error('Error ending match:', error);
        alert('Error al finalizar el partido. Por favor, intenta de nuevo.');
      }
    }
  };

  const handlePositionClick = (team, position) => {
    const positions = team === 'home' ? homePositions : awayPositions;
    console.log("Posiciones antes de la actualización:", positions);
  
    if (isMatchStarted) {
      setSelectedTeam(team);
      setSelectedPosition(position);
      setIsModalOpen(true);  // Abre el modal para seleccionar tipo de punto
    }
  };
  


  const handlePointTypeSelect = async (pointType) => {
    await incrementScore(selectedTeam, pointType);
  
    const positions = selectedTeam === 'home' ? homePositions : awayPositions;
    const playerName = positions[selectedPosition - 1];
  
    const players = selectedTeam === 'home' ? match.home_team.players : match.away_team.players;
    const player = players.find(p => p.name.toLowerCase().trim() === playerName.toLowerCase().trim());
  
    // Aquí debes obtener el performanceId, no el playerId
    const playerPerformance = match.player_performances.find(p => p.player.id === player.id);
  
    if (playerPerformance) {
      try {
        await api.updatePlayerPerformance(playerPerformance.id, {
          points: 1,
          pointType: pointType
        });
      } catch (error) {
        console.error('Error updating player performance:', error);
      }
    } else {
      console.error("No se encontró ninguna performance para el jugador", playerName);
    }
  
    setIsModalOpen(false);  // Cierra el modal
  };
  
  
  
  
  
  

  const renderCourt = (team) => {
    const positions = team === 'home' ? homePositions : awayPositions;
    const setPositions = team === 'home' ? setHomePositions : setAwayPositions;
  
    return (
      <div className="grid grid-rows-3 grid-cols-2 gap-2 w-full h-96 bg-green-200 dark:bg-green-800 border-2 border-white dark:border-gray-600 p-2 rounded-lg">
        {positions.map((player, index) => (
          <div
            key={index}
            className="flex items-center justify-center bg-white dark:bg-gray-700 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-green-300 dark:hover:bg-green-600"
            onClick={() => handlePositionClick(team, index + 1)}
          >
            {isMatchStarted ? (
              <span className="text-3xl font-bold">{index + 1}</span>
            ) : (
              <input
                type="text"
                value={player}  // Aquí debería haber un nombre de jugador.
                onChange={(e) => {
                  const newPositions = [...positions];
                  newPositions[index] = e.target.value;
                  setPositions(newPositions);
                }}
                className="w-full h-full text-center bg-transparent text-lg"
                placeholder={`Jugador ${index + 1}`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };
  
  

  if (loading) {
    return <div className="text-center text-2xl">Cargando...</div>;
  }

  if (error) {
    return <div className="text-center text-2xl text-red-500">Error: {error}</div>;
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="container mx-auto px-4 py-8">
          {match && (
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h1 className="text-4xl font-bold mb-4 text-center">
                {match.home_team.name} vs {match.away_team.name}
              </h1>
              <p className="text-center text-lg mb-2">
                Partido en {match.location} | Fecha: {new Date(match.date).toLocaleString()}
              </p>
              <p className="text-center text-xl mb-6">
                Duración: {formatDuration(matchDuration)}
              </p>

              <div className="flex flex-col md:flex-row justify-between items-start space-y-8 md:space-y-0 md:space-x-8 mb-8">
                <div className="flex-1 text-center">
                  <h2 className="text-2xl font-semibold mb-2">{match.home_team.name}</h2>
                  <div className="text-5xl font-bold mb-4">{homeScore}</div>
                  {renderCourt('home')}
                  <div className="flex justify-center space-x-2 mt-4">
                    <button 
                      onClick={() => decrementScore('home')} 
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-200"
                    >
                      <FaMinus />
                    </button>
                  </div>
                </div>

                <div className="flex-none text-center">
                  <div className="text-5xl font-bold text-orange-600 dark:text-purple-400 mb-4">VS</div>
                  <div className="text-2xl font-semibold mb-4">Set Actual: {currentSet}</div>
                  <button 
                    onClick={handleEndSet} 
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 mb-4 w-full"
                  >
                    Finalizar Set
                  </button>
                  {!isMatchStarted ? (
                    <button 
                      onClick={handleStartMatch} 
                      className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors duration-200 w-full flex items-center justify-center"
                    >
                      <FaPlay className="mr-2" /> Iniciar Partido
                    </button>
                  ) : (
                    <button 
                      onClick={handleEndMatch} 
                      className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors duration-200 w-full flex items-center justify-center"
                    >
                      <FaStop className="mr-2" /> Finalizar Partido
                    </button>
                  )}
                </div>

                <div className="flex-1 text-center">
                  <h2 className="text-2xl font-semibold mb-2">{match.away_team.name}</h2>
                  <div className="text-5xl font-bold mb-4">{awayScore}</div>
                  {renderCourt('away')}
                  <div className="flex justify-center space-x-2 mt-4">
                    <button 
                      onClick={() => decrementScore('away')} 
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors duration-200"
                    >
                      <FaMinus />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para seleccionar tipo de punto */}
      <PointTypeModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPointTypeSelect={handlePointTypeSelect}
      />
    </div>
  );
};

export default VolleyballMatch;

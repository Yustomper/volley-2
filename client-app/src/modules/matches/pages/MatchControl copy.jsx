import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FaStop, FaPlay } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '../../../context/ThemeContext';
import matchesService from '../services/matchesService';
import MatchControlHeader from '../components/MatchControlHeader';
import CourtControl from '../components/CourtControl';

const formatDuration = (seconds) => {
  const pad = (num) => String(num).padStart(2, '0');
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${pad(minutes)}:${pad(remainingSeconds)}`;
};

const MatchControl = () => {
  const { isDarkMode } = useTheme();
  const { matchId } = useParams();
  const [match, setMatch] = useState({
    home_team: { name: '', players: [] },
    away_team: { name: '', players: [] },
    home_positions: Array(6).fill(null),
    away_positions: Array(6).fill(null),
    status: 'pending',
    current_set: 1,
    current_set_started: false,
    sets: [],
    team_a_sets_won: 0,
    team_b_sets_won: 0,
    team_a_timeouts: 0,  // Ya existe en tu respuesta del backend
    team_b_timeouts: 0,  // Ya existe en tu respuesta del backend
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [currentSetDuration, setCurrentSetDuration] = useState(0);
  const [isSetTransitioning, setIsSetTransitioning] = useState(false);

  const fetchMatchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const [matchResponse, performanceResponse] = await Promise.all([
        matchesService.getMatch(matchId),
        matchesService.getPlayerPerformance(matchId)
      ]);

      if (!matchResponse?.data) {
        throw new Error('No se recibieron datos del partido');
      }

      const matchData = matchResponse.data;
      const performanceData = performanceResponse.data;

      const processTeamData = (teamData) => {
        if (!teamData || !Array.isArray(teamData.players)) {
          return { players: [], positions: Array(6).fill(null) };
        }

        const titulares = teamData.players
          .filter(player => player && player.is_starter)
          .map(player => ({
            id: player.id,
            name: player.name,
            jersey_number: player.jersey_number,
            position: player.position,
            is_starter: true
          }));

        const positions = Array(6).fill(null).map((_, index) => {
          return titulares[index] || null;
        });

        return {
          players: teamData.players,
          positions: positions
        };
      };

      const homeTeam = processTeamData(matchData.team_a);
      const awayTeam = processTeamData(matchData.team_b);

      setMatch(prevMatch => ({
        ...matchData,
        home_team: {
          ...matchData.team_a,
          players: homeTeam.players
        },
        away_team: {
          ...matchData.team_b,
          players: awayTeam.players
        },
        home_positions: homeTeam.positions,
        away_positions: awayTeam.positions,
        status: performanceData.status || matchData.status,
        current_set: performanceData.current_set,
        team_a_sets_won: performanceData.team_a_sets_won,
        team_b_sets_won: performanceData.team_b_sets_won,
        sets: performanceData.sets,
        current_set_started: performanceData.sets?.some(set => !set.completed) || false
      }));
    } catch (err) {
      setError('No se pudo cargar el partido');
      console.error('Error fetching match:', err);
      toast.error('Error al cargar el partido');
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  const handleMatchControl = useCallback(async (action) => {
    try {
      setIsLoadingAction(true);
      if (action === 'start') {
        await matchesService.startMatch(matchId);
        toast.success('¡Partido iniciado!');
      } else if (action === 'end') {
        await matchesService.endMatch(matchId);
        toast.success('Partido finalizado');
      }
      await fetchMatchDetails();
    } catch (error) {
      console.error('Error en control de partido:', error);
      setError('Error al controlar el partido');
      toast.error('Error al controlar el partido');
    } finally {
      setIsLoadingAction(false);
    }
  }, [matchId, fetchMatchDetails]);

  const checkSetWinner = useCallback(async (setData) => {
    if (setData.completed && !isSetTransitioning) {
      setIsSetTransitioning(true);
      const winner = setData.team_a_points > setData.team_b_points ?
        match.home_team.name : match.away_team.name;
      const score = `${setData.team_a_points}-${setData.team_b_points}`;

      toast.success(`¡${winner} ha ganado el Set ${setData.set_number}! (${score})`, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        toastId: `set-winner-${setData.set_number}`
      });

      try {
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (match.team_a_sets_won < 3 && match.team_b_sets_won < 3) {
          setCurrentSetDuration(0);
          await fetchMatchDetails();
        } else {
          await handleMatchControl('end');
        }
      } catch (error) {
        console.error('Error al manejar el fin del set:', error);
        toast.error('Error al procesar el fin del set');
      } finally {
        setIsSetTransitioning(false);
      }
    }
  }, [match.home_team.name, match.team_a_sets_won, match.team_b_sets_won, handleMatchControl, fetchMatchDetails, isSetTransitioning]);

  const getCurrentSetScores = useCallback(() => {
    if (match.sets && match.sets.length > 0) {
      const currentSet = match.sets.find(set => !set.completed) || match.sets[match.sets.length - 1];
      return {
        team_a: currentSet?.team_a_points || 0,
        team_b: currentSet?.team_b_points || 0
      };
    }
    return { team_a: 0, team_b: 0 };
  }, [match.sets]);

  const handleAddPoint = async (team, playerId, pointType) => {
    if (!playerId) {
      toast.error('Error: No se puede agregar punto sin jugador');
      return;
    }

    setIsLoadingAction(true);
    try {
      const performanceData = {
        player_id: playerId,
        set_number: match.current_set,
        points: 1,
        aces: pointType === 'ace' ? 1 : 0,
        assists: pointType === 'assist' ? 1 : 0,
        blocks: pointType === 'block' ? 1 : 0
      };

      console.log('Sending performance data:', performanceData);

      const response = await matchesService.updatePlayerPerformance(matchId, performanceData);

      if (response?.data) {
        const updatedPerformance = await matchesService.getMatchPerformance(matchId);
        if (updatedPerformance?.data) {
          setMatch(prevMatch => ({
            ...prevMatch,
            sets: updatedPerformance.data.sets,
            team_a_sets_won: updatedPerformance.data.team_a_sets_won,
            team_b_sets_won: updatedPerformance.data.team_b_sets_won
          }));
          toast.success('Punto agregado correctamente');
        }
      }
    } catch (error) {
      console.error('Error al agregar punto:', error);
      toast.error('Error al agregar punto');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleRevertPoint = async (team) => {
    setIsLoadingAction(true);
    try {
      const currentSet = match.sets?.find(set => set.set_number === match.current_set);
      if (!currentSet) {
        toast.error('No hay set activo para revertir puntos');
        return;
      }

      const teamStats = team === 'home' ? currentSet.team_a_stats : currentSet.team_b_stats;
      if (!teamStats || teamStats.total_points <= 0) {
        toast.warning('No hay puntos para revertir en este equipo');
        return;
      }

      const teamPlayers = team === 'home' ? match.home_team.players : match.away_team.players;
      const lastScoringPlayer = teamPlayers.find(player => player.is_starter);

      if (!lastScoringPlayer) {
        toast.error('No se encontró el jugador para revertir el punto');
        return;
      }

      const performanceData = {
        player_id: lastScoringPlayer.id,
        set_number: match.current_set,
        points: 1,
        aces: 0,
        assists: 0,
        blocks: 0
      };

      console.log('Reverting point with data:', performanceData);

      await matchesService.revertLastPoint(matchId, performanceData);

      const updatedPerformance = await matchesService.getMatchPerformance(matchId);
      if (updatedPerformance?.data) {
        setMatch(prevMatch => ({
          ...prevMatch,
          sets: updatedPerformance.data.sets,
          team_a_sets_won: updatedPerformance.data.team_a_sets_won,
          team_b_sets_won: updatedPerformance.data.team_b_sets_won
        }));
        toast.success('Punto revertido correctamente');
      }
    } catch (error) {
      console.error('Error al revertir punto:', error);
      toast.error('Error al revertir punto');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handlePlayerSwitch = async (substitutionData) => {
    setIsLoadingAction(true);
    try {
      console.log('Datos de sustitución en MatchControl antes de enviar:', substitutionData);
      await matchesService.substitutePlayer(matchId, substitutionData);
      await fetchMatchDetails(); // Recargar los datos del partido
      toast.success('Cambio realizado con éxito');
    } catch (error) {
      console.error('Error en la sustitución:', error);
      toast.error('Error al realizar el cambio');
    } finally {
      setIsLoadingAction(false);
    }
  };

  useEffect(() => {
    fetchMatchDetails();
  }, [fetchMatchDetails]);

  useEffect(() => {
    let timer;
    const updateTimer = () => {
      if (match.status === 'live' && match.current_set_started && !isSetTransitioning) {
        if (match.sets && match.sets.length > 0) {
          const currentSetData = match.sets[match.current_set - 1];
          if (currentSetData) {
            if (currentSetData.completed && !isSetTransitioning) {
              checkSetWinner(currentSetData);
              setCurrentSetDuration(0);
            } else if (!currentSetData.completed) {
              setCurrentSetDuration(prev => prev + 1);
            }
          }
        }
        timer = setInterval(() => {
          setCurrentSetDuration(prev => prev + 1);
        }, 1000);
      } else {
        setCurrentSetDuration(0);
      }
    };

    updateTimer();
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [match.status, match.current_set_started, match.sets, match.current_set, isSetTransitioning, checkSetWinner]);

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className={`text-center text-2xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Cargando...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center text-2xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8 transition-colors duration-200`}>
      <div className="container mx-auto px-4">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          {/* Header con información del partido */}
          <MatchControlHeader
            match={match}
            currentSet={match.current_set}
            currentSetDuration={currentSetDuration}
            homeSetsWon={match.team_a_sets_won}
            awaySetsWon={match.team_b_sets_won}
          />

          {/* Grid principal */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-[4fr_1fr_4fr] gap-6">
            {/* Equipo Local */}
            <div className="md:col-span-1">
              <CourtControl
                team="home"
                teamName={match.home_team.name}
                score={getCurrentSetScores().team_a}
                positions={match.home_positions}
                players={match.home_team.players}
                isMatchStarted={match.status === 'live'}
                onPlayerSwitch={{ matchId, handlePlayerSwitch }}
                matchId={matchId}
                onPointScored={handleAddPoint}
                onScoreDecrement={() => handleRevertPoint('home')}
                timeoutsUsed={match.team_a_timeouts} // Agregar esta línea
              />
            </div>

            {/* Panel Central */}
            <div className="md:col-span-1 flex flex-col items-center justify-center space-y-6">
              {/* Información del Set y Tiempo */}
              <div className="text-center space-y-2">
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-orange-600'}`}>
                  {match.status === 'live' ?
                    (match.current_set_started ?
                      `Set ${match.current_set}` :
                      `Preparando Set ${match.current_set}`
                    ) :
                    `Set ${match.current_set}`
                  }
                </div>
                <div className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {formatDuration(currentSetDuration)}
                </div>
              </div>

              {/* Botones de Control del Partido */}
              {match.status !== 'live' ? (
                // Botón Iniciar Partido
                <button
                  onClick={() => handleMatchControl('start')}
                  disabled={isLoadingAction}
                  className={`w-full max-w-[170px] px-4 py-3 rounded-xl flex items-center justify-center
                    ${isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'}
                    text-white font-medium
                    transition-all duration-200
                    transform hover:scale-105 active:scale-95
                    ${isLoadingAction ? 'opacity-50 cursor-not-allowed' : ''}
                    shadow-lg hover:shadow-xl`}
                >
                  <FaPlay className="mr-2" /> Iniciar Partido
                </button>
              ) : (
                // Botón Finalizar Partido
                <button
                  onClick={() => handleMatchControl('end')}
                  disabled={isLoadingAction}
                  className={`w-full max-w-[170px] px-4 py-3 rounded-xl flex items-center justify-center
                    ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'}
                    text-white font-medium
                    transition-all duration-200
                    transform hover:scale-105 active:scale-95
                    ${isLoadingAction ? 'opacity-50 cursor-not-allowed' : ''}
                    shadow-lg hover:shadow-xl`}
                >
                  <FaStop className="mr-2" /> Finalizar Partido
                </button>
              )}
            </div>

            {/* Equipo Visitante */}
            <div className="md:col-span-1">
              <CourtControl
                team="home"
                teamName={match.home_team.name}
                score={getCurrentSetScores().team_a}
                positions={match.home_positions}
                players={match.home_team.players}
                isMatchStarted={match.status === 'live'}
                onPlayerSwitch={{ matchId, handlePlayerSwitch }}
                onPointScored={handleAddPoint}
                onScoreDecrement={() => handleRevertPoint('home')}
                timeoutsUsed={match.team_b_timeouts} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDarkMode ? "dark" : "light"}
        limit={3}
      />
    </div>
  );
};

export default React.memo(MatchControl);
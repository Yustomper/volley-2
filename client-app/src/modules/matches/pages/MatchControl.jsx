import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FaStop, FaPlay, FaForward } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import matchesService from '../services/matchesService';
import MatchControlHeader from '../components/MatchControlHeader';
import CourtControl from '../components/CourtControl';

const MatchControl = () => {
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
    team_b_sets_won: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [currentSetDuration, setCurrentSetDuration] = useState(0);
  const [isSetTransitioning, setIsSetTransitioning] = useState(false);

  const getCurrentSetScores = useCallback(() => {
    if (match.sets && match.sets.length > 0) {
      const currentSet = match.sets.find(set => set.set_number === match.current_set);
      return {
        team_a: currentSet?.team_a_points || 0,
        team_b: currentSet?.team_b_points || 0
      };
    }
    return { team_a: 0, team_b: 0 };
  }, [match.sets, match.current_set]);

  const checkSetWinner = useCallback((setData) => {
    if (setData.completed) {
      const winner = setData.team_a_points > setData.team_b_points ? 
        match.home_team.name : match.away_team.name;
      const score = `${setData.team_a_points}-${setData.team_b_points}`;
      toast.success(`¡${winner} ha ganado el Set ${setData.set_number}! (${score})`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [match.home_team.name, match.away_team.name]);

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
              setIsSetTransitioning(true);
              checkSetWinner(currentSetData);
              setCurrentSetDuration(0);
              setTimeout(() => {
                setIsSetTransitioning(false);
              }, 3000);
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

  const handleAddPoint = async (team, playerId, pointType) => {
    if (!playerId) {
      setError('Error: No se puede agregar punto sin jugador');
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
  
      // Hacer la llamada al API
      const response = await matchesService.updatePlayerPerformance(matchId, performanceData);
  
      // Solo actualizamos el estado basándonos en la respuesta del backend
      if (response?.data) {
        const updatedPerformance = await matchesService.getMatchPerformance(matchId);
        if (updatedPerformance?.data) {
          setMatch(prevMatch => ({
            ...prevMatch,
            sets: updatedPerformance.data.sets,
            team_a_sets_won: updatedPerformance.data.team_a_sets_won,
            team_b_sets_won: updatedPerformance.data.team_b_sets_won
          }));
        }
      }
    } catch (error) {
      console.error('Error al agregar punto:', error);
      setError('Error al agregar punto');
    } finally {
      setIsLoadingAction(false);
    }
  };
  
  
  
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

  const handleSetControl = useCallback(async (action) => {
    try {
      setIsLoadingAction(true);
      if (action === 'start') {
        await matchesService.startSet(matchId);
        setCurrentSetDuration(0);
        toast.info(`Iniciando Set ${match.current_set}`);
      } else if (action === 'end') {
        await matchesService.endSet(matchId);
        toast.info('Finalizando Set');
      }
      await fetchMatchDetails();
    } catch (error) {
      console.error('Error en control de set:', error);
      setError('Error al controlar el set');
      toast.error('Error al controlar el set');
    } finally {
      setIsLoadingAction(false);
    }
  }, [matchId, fetchMatchDetails, match.current_set]);

  // En MatchControl.jsx

  const handleRevertPoint = async (team) => {
    setIsLoadingAction(true);
    try {
      const currentSet = match.sets[match.current_set - 1];
      if (!currentSet) {
        throw new Error('No hay set activo');
      }
  
      const teamStats = team === 'home' ? currentSet.team_a_stats : currentSet.team_b_stats;
      if (!teamStats || !teamStats.total_points) {
        throw new Error('No hay puntos para revertir');
      }
  
      const performanceData = {
        player_id: 61,
        set_number: match.current_set,
        points: 1,
        aces: 0,
        assists: 0,
        blocks: 0
      };
  
      // Hacer la llamada al API
      const response = await matchesService.revertLastPoint(matchId, performanceData);
  
      // Solo actualizamos el estado basándonos en la respuesta del backend
      if (response?.data) {
        const updatedPerformance = await matchesService.getMatchPerformance(matchId);
        if (updatedPerformance?.data) {
          setMatch(prevMatch => ({
            ...prevMatch,
            sets: updatedPerformance.data.sets,
            team_a_sets_won: updatedPerformance.data.team_a_sets_won,
            team_b_sets_won: updatedPerformance.data.team_b_sets_won
          }));
        }
      }
    } catch (error) {
      console.error('Error al revertir punto:', error);
      setError('Error al revertir punto');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handlePlayerSwitch = useCallback((team, benchPlayerId, fieldPositionIndex) => {
    console.log(`Switch player in team ${team} at position ${fieldPositionIndex} with bench player ${benchPlayerId}`);
    // Implementar lógica de sustitución
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-2xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-2xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  // ... (después de todo el código anterior)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <MatchControlHeader
            match={match}
            currentSet={match.current_set}
            currentSetDuration={currentSetDuration}
            homeSetsWon={match.team_a_sets_won}
            awaySetsWon={match.team_b_sets_won}
          />

          <div className="grid grid-cols-1 md:grid-cols-[4fr_1fr_4fr] gap-6">
            <div className="md:col-span-1">
              <CourtControl
                team="home"
                teamName={match.home_team.name}
                score={getCurrentSetScores().team_a}
                positions={match.home_positions}
                players={match.home_team.players}
                isMatchStarted={match.status === 'live'}
                onPlayerSwitch={handlePlayerSwitch}
                onPointScored={handleAddPoint}
                onScoreDecrement={(playerId, pointType) =>
                  handleRevertPoint('home', playerId, pointType)}
              />
            </div>

            <div className="md:col-span-1 flex flex-col items-center space-y-4">
              <div className="w-full max-w-[170px] mt-20">
                <div className="text-xl font-bold text-center mb-2">
                  {(() => {
                    const currentSetData = match.sets?.find(set => set.set_number === match.current_set);
                    const isSetCompleted = currentSetData?.completed;
                    const nextSetNumber = match.current_set + 1;
                    
                    return isSetCompleted ? 
                      `Preparando Set ${nextSetNumber}` : 
                      `Set ${match.current_set}`;
                  })()}
                </div>
                <button
                  onClick={() => handleSetControl(match.current_set_started ? 'end' : 'start')}
                  disabled={isLoadingAction || match.status !== 'live' || isSetTransitioning}
                  className={`w-full px-4 py-2 rounded-lg flex items-center justify-center space-x-2 
                    ${match.current_set_started ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'}
                    text-white transition-colors duration-200
                    ${(match.status !== 'live' || isSetTransitioning) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FaForward className="mr-2" />
                  {(() => {
                    const currentSetData = match.sets?.find(set => set.set_number === match.current_set);
                    const isSetCompleted = currentSetData?.completed;
                    const nextSetNumber = match.current_set + 1;
                    
                    if (isSetCompleted) {
                      return `Iniciar Set ${nextSetNumber}`;
                    } else {
                      return match.current_set_started ? 'Finalizar Set' : `Iniciar Set ${match.current_set}`;
                    }
                  })()}
                </button>
              </div>

              <div className="w-full max-w-[170px]">
                <button
                  onClick={() => handleMatchControl(match.status === 'live' ? 'end' : 'start')}
                  disabled={isLoadingAction}
                  className={`w-full px-4 py-2 rounded-lg flex items-center justify-center space-x-2 
                    ${match.status === 'live' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                    text-white transition-colors duration-200
                    ${isLoadingAction ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {match.status === 'live' ? (
                    <><FaStop className="mr-2" /> Finalizar Partido</>
                  ) : (
                    <><FaPlay className="mr-2" /> Iniciar Partido</>
                  )}
                </button>
              </div>
            </div>

            <div className="md:col-span-1">
              <CourtControl
                team="away"
                teamName={match.away_team.name}
                score={getCurrentSetScores().team_b}
                positions={match.away_positions}
                players={match.away_team.players}
                isMatchStarted={match.status === 'live'}
                onPlayerSwitch={handlePlayerSwitch}
                onPointScored={handleAddPoint}
                onScoreDecrement={(playerId, pointType) =>
                  handleRevertPoint('away', playerId, pointType)}
              />
            </div>
          </div>
        </div>
      </div>
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
        theme="light"
      />
    </div>
  );
};

export default React.memo(MatchControl);
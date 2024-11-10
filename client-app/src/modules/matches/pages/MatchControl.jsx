import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FaStop, FaPlay, FaForward } from 'react-icons/fa';
import matchesService from '../services/matchesService';
import MatchControlHeader from '../components/MatchControlHeader';
import CourtControl from '../components/CourtControl';

const MatchControl = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState({
    home_team: { name: '', players: [] },
    away_team: { name: '', players: [] },
    home_score: 0,
    away_score: 0,
    home_positions: Array(6).fill(null),
    away_positions: Array(6).fill(null),
    status: 'pending',
    current_set: 1,
    current_set_started: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [currentSetDuration, setCurrentSetDuration] = useState(0);

  const fetchMatchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await matchesService.getMatch(matchId);
      
      if (!response?.data) {
        throw new Error('No se recibieron datos del partido');
      }

      const matchData = response.data;
      
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
        home_score: matchData.team_a_sets_won || 0,
        away_score: matchData.team_b_sets_won || 0,
        status: matchData.status || 'pending',
        current_set: matchData.sets?.length > 0 ? matchData.sets.length : 1,
        current_set_started: matchData.sets?.some(set => !set.completed) || false
      }));

    } catch (err) {
      setError('No se pudo cargar el partido');
      console.error('Error fetching match:', err);
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
      if (match.status === 'in_progress' && match.current_set_started) {
        if (match.sets && match.sets.length > 0) {
          const currentSetData = match.sets[match.current_set - 1];
          if (currentSetData && currentSetData.start_time) {
            const startTime = new Date(currentSetData.start_time);
            const now = new Date();
            const duration = Math.floor((now - startTime) / 1000);
            setCurrentSetDuration(duration);
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
  }, [match.status, match.current_set_started, match.current_set, match.sets]);

  const handleMatchControl = useCallback(async (action) => {
    try {
      setIsLoadingAction(true);
      if (action === 'start') {
        await matchesService.startMatch(matchId);
      } else if (action === 'end') {
        await matchesService.endMatch(matchId);
      }
      await fetchMatchDetails();
    } catch (error) {
      console.error('Error en control de partido:', error);
      setError('Error al controlar el partido');
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
      } else if (action === 'end') {
        await matchesService.endSet(matchId);
      }
      await fetchMatchDetails();
    } catch (error) {
      console.error('Error en control de set:', error);
      setError('Error al controlar el set');
    } finally {
      setIsLoadingAction(false);
    }
  }, [matchId, fetchMatchDetails]);

  const handlePlayerSwitch = useCallback((team, benchPlayerId, fieldPositionIndex) => {
    console.log(`Switch player in team ${team} at position ${fieldPositionIndex} with bench player ${benchPlayerId}`);
  }, []);

  const handleAddPoint = useCallback(async (team, playerId, pointType) => {
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

      await matchesService.updatePlayerPerformance(matchId, performanceData);
      
      // Actualizar solo los datos necesarios
      const updatedMatch = await matchesService.getMatch(matchId);
      if (updatedMatch?.data) {
        const newMatchData = updatedMatch.data;
        setMatch(prevMatch => ({
          ...prevMatch,
          team_a_sets_won: newMatchData.team_a_sets_won,
          team_b_sets_won: newMatchData.team_b_sets_won,
          sets: newMatchData.sets
        }));
      }
    } catch (error) {
      console.error('Error al agregar punto:', error);
      setError('Error al agregar punto');
    } finally {
      setIsLoadingAction(false);
    }
  }, [matchId, match.current_set]);

  const handleRevertPoint = useCallback(async (team, playerId, pointType) => {
    setIsLoadingAction(true);
    try {
      const performanceData = {
        player_id: playerId,
        set_number: match.current_set,
        points: -1,
        aces: pointType === 'ace' ? -1 : 0,
        assists: pointType === 'assist' ? -1 : 0,
        blocks: pointType === 'block' ? -1 : 0
      };

      await matchesService.updatePlayerPerformance(matchId, performanceData);
      
      // Actualizar solo los datos necesarios
      const updatedMatch = await matchesService.getMatch(matchId);
      if (updatedMatch?.data) {
        const newMatchData = updatedMatch.data;
        setMatch(prevMatch => ({
          ...prevMatch,
          team_a_sets_won: newMatchData.team_a_sets_won,
          team_b_sets_won: newMatchData.team_b_sets_won,
          sets: newMatchData.sets
        }));
      }
    } catch (error) {
      console.error('Error al revertir punto:', error);
      setError('Error al revertir punto');
    } finally {
      setIsLoadingAction(false);
    }
  }, [matchId, match.current_set]);

  if (loading) return <div className="text-center text-2xl">Cargando...</div>;
  if (error) return <div className="text-center text-2xl text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <MatchControlHeader
            match={match}
            currentSet={match.current_set}
            currentSetDuration={currentSetDuration}
            homeSetsWon={match.home_sets_won || 0}
            awaySetsWon={match.away_sets_won || 0}
          />

          <div className="grid grid-cols-1 md:grid-cols-[4fr_1fr_4fr] gap-6">
            <div className="md:col-span-1">
              <CourtControl
                team="home"
                teamName={match.home_team.name}
                score={match.home_score}
                positions={match.home_positions}
                players={match.home_team.players}
                isMatchStarted={match.status === 'in_progress'}
                onPlayerSwitch={handlePlayerSwitch}
                onPointScored={handleAddPoint}
                onScoreDecrement={(playerId, pointType) =>
                  handleRevertPoint('home', playerId, pointType)}
              />
            </div>

            <div className="md:col-span-1 flex flex-col items-center space-y-4">
              <div className="w-full max-w-[170px] mt-20">
                <div className="text-xl font-bold text-center mb-2">
                  Set {match.current_set}
                </div>
                <button
                  onClick={() => handleSetControl(match.current_set_started ? 'end' : 'start')}
                  disabled={isLoadingAction || match.status !== 'in_progress'}
                  className={`w-full px-4 py-2 rounded-lg flex items-center justify-center space-x-2 
                    ${match.current_set_started ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'}
                    text-white transition-colors duration-200
                    ${match.status !== 'in_progress' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FaForward className="mr-2" />
                  {match.current_set_started ? 'Finalizar Set' : 'Iniciar Set'}
                </button>
              </div>

              <div className="w-full max-w-[170px]">
                <button
                  onClick={() => handleMatchControl(match.status === 'in_progress' ? 'end' : 'start')}
                  disabled={isLoadingAction}
                  className={`w-full px-4 py-2 rounded-lg flex items-center justify-center space-x-2 
                    ${match.status === 'in_progress' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                    text-white transition-colors duration-200`}
                >
                  {match.status === 'in_progress' ? (
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
                score={match.away_score}
                positions={match.away_positions}
                players={match.away_team.players}
                isMatchStarted={match.status === 'in_progress'}
                currentSet={match.current_set}
                canStartNewSet={!match.current_set_started}
                isLoadingSetAction={isLoadingAction}
                onPlayerSwitch={handlePlayerSwitch}
                onPointScored={handleAddPoint}
                onScoreDecrement={(playerId, pointType) =>
                  handleRevertPoint('away', playerId, pointType)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MatchControl);
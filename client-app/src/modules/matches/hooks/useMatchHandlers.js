// useMatchHandlers.js
import { useState, useRef } from 'react';
import matchesService from '../services/matchesService';

export const useMatchHandlers = () => {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [setScores, setSetScores] = useState([]);
  const [currentSetDuration, setCurrentSetDuration] = useState(0);
  const [isSetFinished, setIsSetFinished] = useState(false);
  const lastScoringPlayer = useRef(null);
  const setTimerRef = useRef(null);

  const handlePositionClick = (isMatchStarted, team, position, playerId) => {
    if (!isMatchStarted) return;
    
    setSelectedTeam(team);
    setSelectedPosition(position);
    setSelectedPlayer(playerId);
    setIsModalOpen(true);
  };

  const handlePositionChange = (team, index, player, match, isMatchStarted, 
    homePositions, awayPositions, setHomePositions, setAwayPositions, setMatch) => {
    if (isMatchStarted) {
      alert('No se pueden cambiar las posiciones una vez iniciado el partido');
      return;
    }

    try {
      const positions = team === 'home' ? [...homePositions] : [...awayPositions];
      positions[index] = player;
      
      if (team === 'home') {
        setHomePositions(positions);
      } else {
        setAwayPositions(positions);
      }

      const teamData = team === 'home' ? match.home_team : match.away_team;
      const updatedPlayers = teamData.players.map(p => ({
        ...p,
        is_holding: p.id === player?.id
      }));

      setMatch(prevMatch => ({
        ...prevMatch,
        [team === 'home' ? 'home_team' : 'away_team']: {
          ...teamData,
          players: updatedPlayers
        }
      }));
    } catch (error) {
      console.error('Error al cambiar posición:', error);
      alert('Error al actualizar la posición del jugador');
    }
  };

  const handlePointTypeSelect = async (matchId, pointType) => {
    if (!selectedPlayer) return;

    try {
      const response = await matchesService.updateMatchScore(matchId, {
        set_number: currentSet,
        player_id: selectedPlayer,
        point_type: pointType,
        undo: false
      });

      if (response.data.status === "success") {
        setHomeScore(response.data.home_score);
        setAwayScore(response.data.away_score);
        lastScoringPlayer.current = { 
          playerId: selectedPlayer, 
          pointType,
          team: selectedTeam 
        };
      }

      setIsModalOpen(false);
      setSelectedPlayer(null);
    } catch (error) {
      console.error('Error al registrar el punto:', error);
      alert('Error al registrar el punto. Por favor, intenta de nuevo.');
    }
  };

  const handleDecrementScore = async (matchId, team) => {
    if (!lastScoringPlayer.current) {
      alert('No hay puntos previos para descontar');
      return;
    }
  
    try {
      const response = await matchesService.updateMatchScore(matchId, {
        set_number: currentSet,
        player_id: lastScoringPlayer.current.playerId,
        point_type: lastScoringPlayer.current.pointType,
        undo: true // Este parámetro indica que es una operación de decrementar
      });
  
      if (response.data.status === "success") {
        setHomeScore(response.data.home_score);
        setAwayScore(response.data.away_score);
        // Limpiar el último jugador que anotó después de descontar
        lastScoringPlayer.current = null;
      }
    } catch (error) {
      console.error('Error al descontar punto:', error);
      alert('Error al descontar el punto');
    }
  };

  const startSetTimer = () => {
    setTimerRef.current = setInterval(() => {
      setCurrentSetDuration(prev => prev + 1);
    }, 1000);
  };

  const stopSetTimer = () => {
    if (setTimerRef.current) {
      clearInterval(setTimerRef.current);
      setTimerRef.current = null;
    }
  };

  const handleEndSet = async (matchId) => {
    try {
      const response = await matchesService.endSet(matchId);
      
      if (response.data.status === "success") {
        stopSetTimer();
        setSetScores(prev => [...prev, {
          set: currentSet,
          home: homeScore,
          away: awayScore,
          duration: currentSetDuration
        }]);
        setIsSetFinished(true);
        
        // Reiniciar los scores para el próximo set
        setHomeScore(0);
        setAwayScore(0);
        lastScoringPlayer.current = null;
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al finalizar el set:', error);
      alert('Error al finalizar el set');
      return false;
    }
  };

  const handleStartNewSet = async (matchId) => {
    try {
      const response = await matchesService.startSet(matchId, currentSet + 1);
      
      if (response.data.status === "success") {
        setCurrentSet(prev => prev + 1);
        setIsSetFinished(false);
        setCurrentSetDuration(0);
        startSetTimer();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al iniciar nuevo set:', error);
      alert('Error al iniciar nuevo set');
      return false;
    }
  };

  const handleStartMatch = async (matchId, homePositions, awayPositions) => {
    const homeTitulares = homePositions.filter(Boolean).length;
    const awayTitulares = awayPositions.filter(Boolean).length;

    if (homeTitulares !== 6 || awayTitulares !== 6) {
      alert('Cada equipo debe tener exactamente 6 jugadores titulares para iniciar el partido.');
      return false;
    }

    try {
      const response = await matchesService.startMatch(matchId);
      if (response.data.status === "success") {
        setHomeScore(0);
        setAwayScore(0);
        setCurrentSet(1);
        setCurrentSetDuration(0);
        startSetTimer();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error starting match:', error);
      alert('Error al iniciar el partido. Por favor, intenta de nuevo.');
      return false;
    }
  };

  return {
    scores: { homeScore, awayScore },
    currentSet,
    setScores,
    currentSetDuration,
    isSetFinished,
    selection: { selectedTeam, selectedPosition, selectedPlayer, isModalOpen },
    handlers: {
      handlePositionClick,
      handlePositionChange,
      handlePointTypeSelect,
      handleStartMatch,
      handleDecrementScore,
      handleEndSet,
      handleStartNewSet,
      setIsModalOpen
    }
  };
};
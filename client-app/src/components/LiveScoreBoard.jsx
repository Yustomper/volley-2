import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const LiveScoreboard = ({ match }) => {
  const { isDarkMode } = useTheme();
  const [score, setScore] = useState({ team1: 0, team2: 0 });
  const [sets, setSets] = useState({ team1: 0, team2: 0 });
  const [time, setTime] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (sets.team1 === 3 || sets.team2 === 3) {
      setWinner(sets.team1 === 3 ? match.team1 : match.team2);
      endMatch();
    }
  }, [sets]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleScoreChange = async (team, value) => {
    const newScore = {
      ...score,
      [team]: Math.max(0, score[team] + value),
    };
    setScore(newScore);

    if (newScore[team] >= 25 && newScore[team] - newScore[team === 'team1' ? 'team2' : 'team1'] >= 2) {
      await endSet(team);
    }

    try {
      await api.updateMatchScore(match.id, newScore);
    } catch (error) {
      console.error('Error updating match score:', error);
    }
  };

  const endSet = async (winningTeam) => {
    const newSets = { ...sets, [winningTeam]: sets[winningTeam] + 1 };
    setSets(newSets);
    setScore({ team1: 0, team2: 0 });
    setCurrentSet(currentSet + 1);

    try {
      await api.updateMatchSets(match.id, newSets);
    } catch (error) {
      console.error('Error updating match sets:', error);
    }
  };

  const endMatch = async () => {
    try {
      await api.updateMatch(match.id, { status: 'Finalizado', winner });
    } catch (error) {
      console.error('Error ending match:', error);
    }
  };

  return (
    <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-pink-200'}`}>
      <div className="flex justify-between items-center mb-4">
        <span className={`text-2xl font-semibold ${isDarkMode ? 'text-purple-400' : 'text-pink-600'}`}>{match.team1}</span>
        <span className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-pink-400'}`}>{formatTime(time)}</span>
        <span className={`text-2xl font-semibold ${isDarkMode ? 'text-purple-400' : 'text-pink-600'}`}>{match.team2}</span>
      </div>
      <div className="flex justify-between items-center text-4xl font-bold mb-4">
        <div>
          <button onClick={() => handleScoreChange('team1', -1)} className="text-red-500 mr-2">-</button>
          {score.team1}
          <button onClick={() => handleScoreChange('team1', 1)} className="text-green-500 ml-2">+</button>
        </div>
        <span className={`text-2xl ${isDarkMode ? 'text-gray-400' : 'text-pink-400'}`}>Set {currentSet}</span>
        <div>
          <button onClick={() => handleScoreChange('team2', -1)} className="text-red-500 mr-2">-</button>
          {score.team2}
          <button onClick={() => handleScoreChange('team2', 1)} className="text-green-500 ml-2">+</button>
        </div>
      </div>
      <div className="flex justify-between items-center text-2xl">
        <span>{sets.team1}</span>
        <span className={`${isDarkMode ? 'text-gray-400' : 'text-pink-400'}`}>Sets</span>
        <span>{sets.team2}</span>
      </div>
      {winner && (
        <div className={`mt-4 text-center text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-pink-600'}`}>
          Ganador: {winner}
        </div>
      )}
    </div>
  );
};

export default LiveScoreboard;
import React, { useState, useEffect } from 'react';
import { Timer, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import matchesService from '../../services/matchesService';

const TIMEOUT_DURATION = 30; // Duración del tiempo fuera en segundos

const TimeoutControl = ({ 
  team, 
  matchId, 
  timeoutsUsed = 0, 
  maxTimeouts = 2,
  isMatchStarted = false,
  isDarkMode,
  onTimeoutEnd
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTimeoutActive, setIsTimeoutActive] = useState(false);
  const [timeoutCounter, setTimeoutCounter] = useState(TIMEOUT_DURATION);
  const [remainingTimeouts, setRemainingTimeouts] = useState(maxTimeouts - timeoutsUsed);

  useEffect(() => {
    let intervalId;
    
    if (isTimeoutActive && timeoutCounter > 0) {
      intervalId = setInterval(() => {
        setTimeoutCounter(prev => {
          if (prev <= 1) {
            setIsTimeoutActive(false);
            onTimeoutEnd && onTimeoutEnd();
            toast.info('Tiempo fuera finalizado');
            return TIMEOUT_DURATION;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isTimeoutActive, timeoutCounter, onTimeoutEnd]);

  useEffect(() => {
    setRemainingTimeouts(maxTimeouts - timeoutsUsed);
  }, [timeoutsUsed, maxTimeouts]);

  const handleTimeout = async () => {
    if (timeoutsUsed >= maxTimeouts) {
      toast.warning(`No quedan tiempos fuera disponibles en este set`);
      return;
    }

    if (isTimeoutActive) {
      toast.warning('Ya hay un tiempo fuera en curso');
      return;
    }

    try {
      setIsLoading(true);
      await matchesService.requestTimeout(matchId, { team: team === 'home' ? 'A' : 'B' });
      
      // Iniciar el contador de tiempo fuera
      setIsTimeoutActive(true);
      setTimeoutCounter(TIMEOUT_DURATION);
      setRemainingTimeouts(prev => prev - 1);
      
      toast.success('Tiempo fuera iniciado');
    } catch (error) {
      console.error('Error al solicitar tiempo fuera:', error);
      toast.error('Error al solicitar tiempo fuera');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Contador de tiempo fuera activo */}
      {isTimeoutActive && (
        <div className={`
          absolute -left-16 top-1/2 -translate-y-1/2
          px-2 py-1 rounded-lg
          ${isDarkMode ? 'bg-red-900/50' : 'bg-red-100'}
          ${isDarkMode ? 'text-red-300' : 'text-red-600'}
          font-bold text-sm
        `}>
          {timeoutCounter}s
        </div>
      )}

      {/* Botón de tiempo fuera */}
      <button
        onClick={handleTimeout}
        disabled={!isMatchStarted || timeoutsUsed >= maxTimeouts || isLoading || isTimeoutActive}
        className={`
          group relative p-2 rounded-full transition-all duration-200
          ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
          ${(!isMatchStarted || timeoutsUsed >= maxTimeouts || isTimeoutActive) ? 'opacity-50 cursor-not-allowed' : ''}
          ${isLoading ? 'animate-pulse' : ''}
        `}
        title={
          !isMatchStarted 
            ? 'El partido debe estar en curso'
            : isTimeoutActive
              ? 'Tiempo fuera en curso'
              : timeoutsUsed >= maxTimeouts 
                ? 'No hay más tiempos fuera disponibles' 
                : 'Solicitar tiempo fuera'
        }
      >
        <Timer 
          className={`w-6 h-6 ${
            isDarkMode ? 'text-purple-400' : 'text-orange-600'
          }`}
        />
        
        {/* Indicador de tiempos restantes */}
        <div className={`
          absolute -top-2 -right-2 w-5 h-5 rounded-full 
          flex items-center justify-center text-xs font-bold
          ${isDarkMode 
            ? 'bg-gray-700 text-purple-400' 
            : 'bg-orange-100 text-orange-600'
          }
        `}>
          {remainingTimeouts}
        </div>
      </button>

      {/* Indicador de tiempos agotados */}
      {timeoutsUsed >= maxTimeouts && !isTimeoutActive && (
        <div className={`
          absolute top-full left-1/2 transform -translate-x-1/2 mt-2
          px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap
          flex items-center gap-1
          ${isDarkMode 
            ? 'bg-gray-700 text-gray-300' 
            : 'bg-gray-100 text-gray-600'
          }
        `}>
          <AlertCircle className="w-4 h-4" />
          Sin tiempos fuera
        </div>
      )}
    </div>
  );
};

export default TimeoutControl;
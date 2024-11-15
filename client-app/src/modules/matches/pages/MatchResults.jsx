import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Radar } from 'react-chartjs-2';
import { Trophy, MapPin, Calendar } from 'lucide-react';
import matchesService from '../services/matchesService';
import { Chart as ChartJS } from 'chart.js/auto';

const MatchResults = () => {
  const { matchId } = useParams();
  const [match, setMatch] = useState(null);
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const response = await matchesService.getMatch(matchId);
        setMatch(response.data);
        setSets(response.data.sets || []);
      } catch (error) {
        console.error('Error fetching match:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [matchId]);

  if (loading) {
    return <div className="text-center p-8">Cargando...</div>;
  }

  if (!match) {
    return <div className="text-center p-8">Partido no encontrado</div>;
  }

  const mockRadarData = {
    labels: ['Ataques', 'Bloqueos', 'Servicios', 'Defensas', 'Asistencias'],
    datasets: [
      {
        label: match.team_a.name,
        data: [65, 12, 8, 55, 58],
        backgroundColor: 'rgba(72, 187, 120, 0.2)',
        borderColor: 'rgba(72, 187, 120, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(72, 187, 120, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(72, 187, 120, 1)'
      },
      {
        label: match.team_b.name,
        data: [60, 10, 7, 50, 54],
        backgroundColor: 'rgba(245, 101, 101, 0.2)',
        borderColor: 'rgba(245, 101, 101, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(245, 101, 101, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(245, 101, 101, 1)'
      }
    ]
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 70,
        ticks: {
          stepSize: 10,
          color: 'rgba(255, 255, 255, 0.7)',
          backdropColor: 'transparent'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
        angleLines: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: { size: 14 }
        }
      }
    }
  };

  const TeamCard = ({ team, isWinner, stats }) => (
    <div className="bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-white flex items-center">
          {team}
          {isWinner && <Trophy className="ml-2 text-yellow-400" size={24} />}
        </h2>
        <span className={`text-lg font-bold px-3 py-1 rounded ${
          isWinner ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {isWinner ? 'Ganador' : 'Perdedor'}
        </span>
      </div>
      <div className="space-y-2">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-gray-400 capitalize">{key}</span>
            <span className="text-white font-semibold">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const mockStats = {
    equipo_a: {
      attacks: 65,
      blocks: 12,
      serves: 8,
      digs: 55,
      assists: 58
    },
    equipo_b: {
      attacks: 60,
      blocks: 10,
      serves: 7,
      digs: 50,
      assists: 54
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">Resultados del Partido</h1>
        
        {/* Header con info básica */}
        <div className="bg-gray-800/80 backdrop-blur rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <div className="flex items-center text-white">
              <Calendar className="mr-2" size={20} />
              <span>{new Date(match.scheduled_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-white">
              <MapPin className="mr-2" size={20} />
              <span>{match.location}</span>
            </div>
          </div>
          <div className="text-center">
            <span className="text-6xl font-bold text-white">
              {match.team_a_sets_won}-{match.team_b_sets_won}
            </span>
            <div className="flex justify-center mt-4 space-x-4">
              {sets.map((set, index) => (
                <span key={index} className="px-4 py-2 bg-gray-700 text-gray-200 rounded-full text-lg">
                  {set.team_a_points}-{set.team_b_points}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Grid de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <TeamCard 
            team={match.team_a.name}
            isWinner={match.team_a_sets_won > match.team_b_sets_won}
            stats={mockStats.equipo_a}
          />
          <div className="bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-white">Estadísticas del Equipo</h2>
            <div className="w-full h-[400px]">
              <Radar data={mockRadarData} options={radarOptions} />
            </div>
          </div>
        </div>

        {/* Tabla de sets */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-white">Sets</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-white">
              <thead className="text-xs uppercase bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3">Set</th>
                  <th scope="col" className="px-6 py-3">{match.team_a.name}</th>
                  <th scope="col" className="px-6 py-3">{match.team_b.name}</th>
                </tr>
              </thead>
              <tbody>
                {sets.map((set) => (
                  <tr key={set.set_number} className="border-b border-gray-700">
                    <td className="px-6 py-4 font-medium">Set {set.set_number}</td>
                    <td className="px-6 py-4">{set.team_a_points}</td>
                    <td className="px-6 py-4">{set.team_b_points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchResults;
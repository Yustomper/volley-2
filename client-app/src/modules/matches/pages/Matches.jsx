import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { Search, Plus, ChevronLeft, ChevronRight, Calendar, Clock, 
  MapPin, Info, Activity, CheckCircle, AlertTriangle, RefreshCw, HelpCircle, Trophy 
} from 'lucide-react';
import api from '../services/matchesService';
import tournamentApi from '../../tournament/services/tournamentService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MatchFormModal from '../components/match-summary/MatchFormModal';
import ModalTournament from '../../tournament/components/ModalTournament';
import { formatDateTime } from '../utils/dateFormatter';


const Matches = () => {
  const { isDarkMode } = useTheme();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 6, total: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        search,
        ordering: `${sortOrder === 'asc' ? '' : '-'}team_a__name`,
      };
      const response = await api.getMatches(params);
      
      if (response && response.data) {
        const matchesData = Array.isArray(response.data) ? response.data : response.data.results;
        const totalCount = response.data.count || matchesData.length;
        
        if (Array.isArray(matchesData)) {
          setMatches(matchesData);
          setPagination(prev => ({ ...prev, total: totalCount }));
        } else {
          throw new Error('Los datos de los partidos no son un array');
        }
      } else {
        throw new Error('Respuesta de API inválida');
      }
    } catch (error) {
      console.error('Error al cargar los partidos:', error);
      toast.error('Error al cargar los partidos: ' + error.message);
      setMatches([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, search, sortOrder]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleTournamentSubmit = async (tournamentData) => {
    try {
      await tournamentApi.createTournaments(tournamentData);
      toast.success('Torneo creado exitosamente');
      setIsTournamentModalOpen(false);
    } catch (error) {
      toast.error('Error al crear el torneo: ' + error.message);
    }
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortOrderChange = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleMatchSubmit = () => {
    setIsModalOpen(false);
    fetchMatches();
  };


  
  const handleModalClose = () => {
    setIsModalOpen(false);
  };


  const renderMatchesList = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <MatchSkeleton key={index} isDarkMode={isDarkMode} />
          ))}
        </div>
      );
    }

    if (!matches || matches.length === 0) {
      return <p className="col-span-3 text-center text-gray-500">No hay partidos disponibles.</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {matches.map((match) => {
          // Formatear la fecha y hora
          const { date, time } = formatDateTime(match.scheduled_date);
          // Mapear el estado a un ícono y texto
          const statusMap = {
            'upcoming': { text: 'Próximamente', icon: <Clock className="w-5 h-5 mr-2" /> },
            'live': { text: 'En vivo', icon: <Activity className="w-5 h-5 mr-2" /> },
            'finished': { text: 'Finalizado', icon: <CheckCircle className="w-5 h-5 mr-2" /> },
            'suspended': { text: 'Suspendido', icon: <AlertTriangle className="w-5 h-5 mr-2" /> },
            'rescheduled': { text: 'Reprogramado', icon: <RefreshCw className="w-5 h-5 mr-2" /> },
          };
          const statusInfo = statusMap[match.status] || { text: 'Desconocido', icon: <HelpCircle className="w-5 h-5 mr-2" /> };
          return (
            <div key={match.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
              {/* Badge del Torneo */}
              <div className="mb-2">
                <span className={`inline-block px-3 py-1 text-sm font-semibold ${isDarkMode ? 'bg-purple-600 text-white' : 'bg-orange-500 text-white'} rounded-full`}>
                  {match.tournament?.name}
                </span>
              </div>
              <h3 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-purple-400' : 'text-orange-600'}`}>
                {match.team_a?.name} vs {match.team_b?.name}
              </h3>
              {/* Mostrar la fecha y hora con íconos */}
              <p className={`mb-2 flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Calendar className="w-5 h-5 mr-2" />
                Fecha: {date}
              </p>
              <p className={`mb-4 flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Clock className="w-5 h-5 mr-2" />
                Hora: {time}
              </p>
               {/* Ubicación */}
              <p className={`mb-4 flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <MapPin className="w-5 h-5 mr-2" />
                Ubicación: {match.location}
              </p>
              {/* Estado */}
              <p className={`mb-4 flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {statusInfo.icon}
                Estado: {statusInfo.text}
              </p>
              <Link
                to={`/match-details/${match.id}`}
                className={`inline-block px-4 py-2 rounded  ${
                  isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-orange-500 hover:bg-orange-600'
                } text-white transition duration-300 flex items-center w-30 justify-center`}
              >
                 <Info className="w-5 h-5 mr-2" />
                Información
              </Link>
            </div>
          );
        })}
      </div>
    );
  };

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);


  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <h1 className={`text-4xl font-bold text-center md:text-left ${isDarkMode ? 'text-purple-400' : 'text-orange-600'}`}>
            Partidos
          </h1>
          
          {/* Flex column para móviles, flex-row para pantallas grandes */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4 sm:mt-0">
            <button
              onClick={() => setIsTournamentModalOpen(true)}
              className={`${isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-orange-500 hover:bg-orange-600'} 
                text-white px-6 py-3 rounded-full transition duration-300 flex items-center justify-center`}
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear Torneo
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className={`${isDarkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-orange-500 hover:bg-orange-600'} 
                text-white px-6 py-3 rounded-full transition duration-300 flex items-center justify-center`}
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear Partido
            </button>
          </div>
        </div>
  
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Buscar partidos..."
              className={`p-2 pl-10 border rounded w-full focus:outline-none focus:ring-2 focus:ring-orange-500
                ${isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-black placeholder-gray-500'}`}
              value={search}
              onChange={handleSearch}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <button 
            onClick={handleSortOrderChange}
            className={`${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'} 
              px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-orange-500`}
          >
            Ordenar: {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </button>
        </div>
  
        {renderMatchesList()}
  
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center space-x-4">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`${pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : ''} 
                ${isDarkMode ? 'text-white' : 'text-black'}`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <span className={isDarkMode ? 'text-white' : 'text-black'}>
              Página {pagination.page} de {totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              className={`${pagination.page >= totalPages ? 'opacity-50 cursor-not-allowed' : ''} 
                ${isDarkMode ? 'text-white' : 'text-black'}`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
  
        {/* Modales */}
        <MatchFormModal 
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleMatchSubmit}
        />
  
        <ModalTournament
          open={isTournamentModalOpen}
          onClose={() => setIsTournamentModalOpen(false)}
          onSubmit={handleTournamentSubmit}
        />
  
        <ToastContainer 
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={isDarkMode ? "dark" : "light"}
        />
      </div>
    </div>
  );
  
  
};

const MatchSkeleton = ({ isDarkMode }) => (
  <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-xl shadow-lg`}>
    <div className={`h-8 w-3/4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-4 animate-pulse`}></div>
    <div className={`h-4 w-1/2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-2 animate-pulse`}></div>
    <div className={`h-4 w-2/3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-4 animate-pulse`}></div>
    <div className={`h-4 w-1/3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-4 animate-pulse`}></div>
    <div className={`h-10 w-1/3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded animate-pulse`}></div>
  </div>
);

export default Matches;

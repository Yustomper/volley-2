// client-app/src/modules/matches/pages/MatchDetails.jsx

import React from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import MatchSummary from '../components/MatchSummary';
import useMatchDetails from '../hooks/useMatchDetails';

const MatchDetails = () => {
  const { isDarkMode } = useTheme();
  const { matchId } = useParams();
  const { match, loading, error, refreshMatchData } = useMatchDetails(matchId);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="container mx-auto px-4 py-8">
          {match && (
            <MatchSummary match={match} refreshMatchData={refreshMatchData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchDetails;

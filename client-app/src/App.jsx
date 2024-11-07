import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './modules/auth/context/AuthContext';
import Navbar from './components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importación de páginas
import Home from './pages/Home';
import Team from './modules/team/pages/Team';
import Matches from './modules/matches/pages/Matches';
import MatchDetails from './modules/matches/pages/MatchDetails';
import Statistics from './pages/Statistics';
import LiveScoreBoard from './components/LiveScoreBoard';
import Login from './modules/auth/pages/Login';
import Register from './modules/auth/pages/Register';

import NotFound from './components/NotFound';
// import VolleyballMatch from './modules/matches/components/VolleyballMatch';
import MatchControl from './modules/matches/pages/MatchControl';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/team" element={<Team />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/match-details/:matchId" element={<MatchDetails />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/live-scoreboard/:matchId" element={<LiveScoreBoard />} />
                <Route path="/volleyball/:matchId" element={<MatchControl />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
          <ToastContainer />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
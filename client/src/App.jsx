import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import client from './config/apollo.js';
import { AuthProvider } from './contexts/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import GameAssistantWidget from './components/assistant/GameAssistantWidget.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import GamePage from './pages/GamePage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

const App = () => {
  return (
    <ApolloProvider client={client}>
      <Router>
        <AuthProvider>
          <Navbar />
          <GameAssistantWidget />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game"
              element={
                <ProtectedRoute>
                  <GamePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <LeaderboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ApolloProvider>
  );
};

export default App;

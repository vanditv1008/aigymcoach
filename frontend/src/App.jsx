import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import WorkoutPage from './pages/WorkoutPage';
import HistoryPage from './pages/HistoryPage';
import './index.css';

const MainApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedExercise, setSelectedExercise] = useState('Squats');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  const handleSelectExercise = (exerciseName) => {
    setSelectedExercise(exerciseName);
    setActiveTab('workout');
  };

  return (
    <ProtectedRoute
      fallback={
        authMode === 'login' ? (
          <LoginPage onSwitchToRegister={() => setAuthMode('register')} />
        ) : (
          <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />
        )
      }
    >
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main style={{ flexGrow: 1, paddingTop: '16px' }}>
          {activeTab === 'dashboard' && (
            <DashboardPage onSelectExercise={handleSelectExercise} />
          )}

          {activeTab === 'workout' && (
            <WorkoutPage initialExercise={selectedExercise} />
          )}

          {activeTab === 'history' && (
            <HistoryPage />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

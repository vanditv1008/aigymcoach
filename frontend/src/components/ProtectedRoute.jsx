import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, fallback }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Loading AI Gym Coach...</div>
      </div>
    );
  }

  if (!user) {
    return fallback;
  }

  return children;
};

export default ProtectedRoute;

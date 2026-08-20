import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Dumbbell, LayoutDashboard, History, Play, LogOut, User } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="glass-panel" style={{ margin: '16px 24px', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
        <div style={{ background: 'var(--primary-gradient)', padding: '8px', borderRadius: '12px', display: 'flex' }}>
          <Dumbbell size={24} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Apna AI Coach
          </h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time Exercise Vision</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          className={activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={18} /> Dashboard
        </button>

        <button
          className={activeTab === 'workout' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          onClick={() => setActiveTab('workout')}
        >
          <Play size={18} /> Start Workout
        </button>

        <button
          className={activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          onClick={() => setActiveTab('history')}
        >
          <History size={18} /> History
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
          <User size={16} color="var(--primary-accent)" />
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user.username}</span>
        </div>

        <button
          className="btn-danger"
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          onClick={logout}
          title="Log Out"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

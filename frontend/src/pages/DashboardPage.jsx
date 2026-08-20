import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Play, Dumbbell, Activity, Clock, Flame, ArrowRight } from 'lucide-react';

const DashboardPage = ({ onSelectExercise }) => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [exRes, histRes] = await Promise.all([
          api.get('/api/exercises'),
          api.get('/api/workouts/history')
        ]);
        setExercises(exRes.data.exercises || []);
        setHistory(histRes.data.workouts || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const totalWorkouts = history.length;
  const totalReps = history.reduce((acc, curr) => acc + (curr.reps || 0), 0);
  const totalTimeMinutes = Math.round(history.reduce((acc, curr) => acc + (curr.time || 0), 0) / 60);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 48px' }} className="animate-fade-in">
      {/* Welcome Banner */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>
            Hello, <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user?.username}</span> 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Ready for your AI-guided fitness session? Choose an exercise or view your history.
          </p>
        </div>
        <button className="btn-primary" onClick={() => onSelectExercise('Squats')}>
          <Play size={20} /> Quick Start Workout
        </button>
      </div>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <Activity size={28} color="var(--primary-accent)" />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL SESSIONS</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '700' }}>{totalWorkouts}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
            <Flame size={28} color="#a855f7" />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL REPETITIONS</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '700' }}>{totalReps}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <Clock size={28} color="var(--success-color)" />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL TIME (MINS)</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '700' }}>{totalTimeMinutes}</h2>
          </div>
        </div>
      </div>

      {/* Exercises Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Dumbbell color="var(--primary-accent)" /> Available Exercises
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {exercises.map((ex) => (
            <div
              key={ex}
              className="glass-panel"
              style={{ padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden' }}
              onClick={() => onSelectExercise(ex)}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '8px' }}>{ex}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Real-time pose & form tracking</p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--primary-accent)', fontWeight: '600' }}>
                Select <ArrowRight size={14} />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '20px' }}>Recent Workouts</h2>
        
        <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
              No previous workout history found. Start your first workout session!
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px 16px' }}>EXERCISE</th>
                  <th style={{ padding: '12px 16px' }}>REPS</th>
                  <th style={{ padding: '12px 16px' }}>SETS</th>
                  <th style={{ padding: '12px 16px' }}>TIME (SEC)</th>
                  <th style={{ padding: '12px 16px' }}>DATE</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 5).map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '16px', fontWeight: '600' }}>{row.exercise_name}</td>
                    <td style={{ padding: '16px' }}>{row.reps}</td>
                    <td style={{ padding: '16px' }}>{row.sets}</td>
                    <td style={{ padding: '16px' }}>{row.time}s</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

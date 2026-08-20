import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { History, Calendar, Flame, Clock, Dumbbell } from 'lucide-react';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/workouts/history');
        setHistory(res.data.workouts || []);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 48px' }} className="animate-fade-in">
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ background: 'var(--primary-gradient)', padding: '14px', borderRadius: '16px', display: 'flex' }}>
          <History size={28} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Your Workout History</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Complete log of your exercises recorded in your account
          </p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Loading workout records...
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
            <Dumbbell size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <h3>No workouts logged yet</h3>
            <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>Start a workout session from the dashboard or workout tab.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <th style={{ padding: '16px' }}>EXERCISE</th>
                <th style={{ padding: '16px' }}>REPS</th>
                <th style={{ padding: '16px' }}>SETS</th>
                <th style={{ padding: '16px' }}>TIME</th>
                <th style={{ padding: '16px' }}>DATE</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Dumbbell size={18} color="var(--primary-accent)" />
                    {row.exercise_name}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                      <Flame size={16} color="#a855f7" /> {row.reps}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>{row.sets}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                      <Clock size={16} /> {row.time}s
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={16} /> {new Date(row.created_at).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;

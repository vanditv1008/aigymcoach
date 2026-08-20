import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Play, Square, Camera, RefreshCw, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';

const EXERCISES = ['Squats', 'Push-ups', 'Biceps Curls (Dumbbell)', 'Shoulder Press', 'Lunges'];

const WorkoutPage = ({ initialExercise }) => {
  const [selectedExercise, setSelectedExercise] = useState(initialExercise || 'Squats');
  const [targetSets, setTargetSets] = useState(3);
  const [repsPerSet, setRepsPerSet] = useState(10);
  const [isWorkingOut, setIsWorkingOut] = useState(false);

  // Real-time State
  const [poseDetected, setPoseDetected] = useState(false);
  const [currentReps, setCurrentReps] = useState(0);
  const [setsCompleted, setSetsCompleted] = useState(0);
  const [metrics, setMetrics] = useState({});
  const [coachFeedback, setCoachFeedback] = useState('');
  const [annotatedFrame, setAnnotatedFrame] = useState(null);
  const [cameraError, setCameraError] = useState('');

  // Timer state
  const [startTime, setStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isAnalyzingRef = useRef(false);

  // Setup camera when workout starts
  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        setCameraError('');
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: false
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error('Camera access error:', err);
        setCameraError('Unable to access camera. Please check browser permissions.');
      }
    };

    if (isWorkingOut) {
      startCamera();
      setStartTime(Date.now());
      setElapsedSeconds(0);
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isWorkingOut]);

  // Elapsed timer tick
  useEffect(() => {
    let interval = null;
    if (isWorkingOut && startTime) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWorkingOut, startTime]);

  // Real-time Frame Analysis Loop
  useEffect(() => {
    let timeoutId = null;

    const analyzeLoop = async () => {
      if (!isWorkingOut || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video.readyState === 4 && !isAnalyzingRef.current) {
        isAnalyzingRef.current = true;
        try {
          const ctx = canvas.getContext('2d');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const base64Frame = canvas.toDataURL('image/jpeg', 0.6);

          const response = await api.post('/api/vision/analyze-frame', {
            exercise: selectedExercise,
            frame: base64Frame
          });

          const data = response.data;
          setPoseDetected(data.pose_detected);
          setMetrics(data.metrics || {});
          if (data.annotated_frame) {
            setAnnotatedFrame(data.annotated_frame);
          }
          if (data.coach_feedback) {
            setCoachFeedback(data.coach_feedback);
          }

          // Calculate reps & sets
          const totalReps = data.reps || 0;
          setCurrentReps(totalReps);
          if (repsPerSet > 0) {
            setSetsCompleted(Math.floor(totalReps / repsPerSet));
          }

        } catch (err) {
          console.error('Frame processing loop error:', err);
        } finally {
          isAnalyzingRef.current = false;
        }
      }

      timeoutId = setTimeout(analyzeLoop, 150); // ~6 fps for stable real-time analysis
    };

    if (isWorkingOut) {
      analyzeLoop();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isWorkingOut, selectedExercise, repsPerSet]);

  const handleStartWorkout = async () => {
    setIsWorkingOut(true);
    setCurrentReps(0);
    setSetsCompleted(0);
    setCoachFeedback('Get into position. Workout starting!');

    try {
      const res = await api.post('/api/coaching/feedback', {
        event: 'workout_started',
        exercise: selectedExercise,
        metrics: {}
      });
      if (res.data.feedback) {
        setCoachFeedback(res.data.feedback);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEndWorkout = async () => {
    setIsWorkingOut(false);

    try {
      // Save workout to backend database under authenticated user
      const durationSec = elapsedSeconds || 1;
      await api.post('/api/workouts', {
        exercise_name: selectedExercise,
        reps: currentReps,
        sets: Math.max(1, setsCompleted),
        time_taken: durationSec
      });

      alert(`Workout Completed & Saved! 🎉\nExercise: ${selectedExercise}\nTotal Reps: ${currentReps}\nSets: ${Math.max(1, setsCompleted)}\nDuration: ${durationSec}s`);
    } catch (err) {
      console.error('Failed to save workout:', err);
      alert('Workout ended. Note: saving to server encountered an error.');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 48px' }} className="animate-fade-in">
      {!isWorkingOut ? (
        /* WORKOUT CONFIGURATION VIEW */
        <div className="glass-panel" style={{ maxWidth: '600px', margin: '40px auto', padding: '40px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '8px', textAlign: 'center' }}>
            Configure Your Workout
          </h1>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '32px' }}>
            Select exercise target parameters for live AI tracking
          </p>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-muted)' }}>
              EXERCISE TYPE
            </label>
            <select value={selectedExercise} onChange={(e) => setSelectedExercise(e.target.value)}>
              {EXERCISES.map((ex) => (
                <option key={ex} value={ex}>{ex}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-muted)' }}>
                TARGET SETS
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={targetSets}
                onChange={(e) => setTargetSets(parseInt(e.target.value) || 1)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-muted)' }}>
                REPS PER SET
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={repsPerSet}
                onChange={(e) => setRepsPerSet(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <button className="btn-primary" style={{ width: '100%', padding: '16px' }} onClick={handleStartWorkout}>
            <Play size={20} /> Start Live Workout
          </button>
        </div>
      ) : (
        /* LIVE WORKOUT STUDIO VIEW */
        <div>
          {/* Header Bar */}
          <div className="glass-panel" style={{ padding: '20px 32px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--primary-accent)', fontWeight: '700', textTransform: 'uppercase' }}>
                LIVE AI STUDIO
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{selectedExercise}</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ELAPSED TIME</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{elapsedSeconds}s</h3>
              </div>

              <button className="btn-danger" onClick={handleEndWorkout}>
                <Square size={18} /> End Workout
              </button>
            </div>
          </div>

          {/* AI Coach Text Banner */}
          {coachFeedback && (
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '16px 24px', borderRadius: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '1.5rem' }}>🤖</span>
              <div>
                <strong style={{ color: 'var(--primary-accent)', display: 'block', fontSize: '0.85rem' }}>AI COACH FEEDBACK</strong>
                <span style={{ fontSize: '1.05rem', fontWeight: '600' }}>{coachFeedback}</span>
              </div>
            </div>
          )}

          {/* Main Grid: Video Stream + Real-Time Metrics Sidebar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
            {/* Camera Viewport */}
            <div className="glass-panel" style={{ padding: '16px', position: 'relative', minHeight: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', borderRadius: '16px', overflow: 'hidden' }}>
              {/* Hidden raw video element */}
              <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
              {/* Hidden canvas for capturing frame */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {annotatedFrame ? (
                <img
                  src={annotatedFrame}
                  alt="Live Pose Feed"
                  style={{ width: '100%', height: 'auto', borderRadius: '12px', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Camera size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p>Initializing camera & MediaPipe pose engine...</p>
                </div>
              )}

              {cameraError && (
                <div style={{ position: 'absolute', background: 'rgba(239, 68, 68, 0.9)', color: '#fff', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                  {cameraError}
                </div>
              )}
            </div>

            {/* Metrics Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Rep & Set Progress Card */}
              <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL REPETITIONS</span>
                <h1 style={{ fontSize: '3.5rem', fontWeight: '800', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '4px 0' }}>
                  {currentReps}
                </h1>
                <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SETS COMPLETED</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{setsCompleted} / {targetSets}</h3>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CURRENT SET REPS</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{currentReps % repsPerSet} / {repsPerSet}</h3>
                  </div>
                </div>
              </div>

              {/* Dynamic Exercise Metrics Card */}
              <div className="glass-panel" style={{ padding: '24px', flexGrow: 1 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} color="var(--primary-accent)" /> Pose Metrics
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedExercise === 'Squats' && (
                    <>
                      <MetricRow label="Knee Angle" value={`${metrics.knee_angle || 0}°`} />
                      <MetricRow label="Back Angle" value={`${metrics.back_angle || 0}°`} />
                      <MetricRow label="Depth Status" value={metrics.depth_status || 'GOOD DEPTH'} isStatus />
                    </>
                  )}

                  {selectedExercise === 'Push-ups' && (
                    <>
                      <MetricRow label="Elbow Angle" value={`${metrics.elbow_angle || 0}°`} />
                      <MetricRow label="Body Alignment" value={metrics.body_alignment || 'Straight'} isStatus />
                      <MetricRow label="Hip Status" value={metrics.hip_status || 'LEVEL'} isStatus />
                    </>
                  )}

                  {selectedExercise === 'Biceps Curls (Dumbbell)' && (
                    <>
                      <MetricRow label="Elbow Angle" value={`${metrics.elbow_angle || 0}°`} />
                      <MetricRow label="Shoulder Status" value={metrics.shoulder_status || 'STABLE'} isStatus />
                      <MetricRow label="Swing Detection" value={metrics.swing_status || 'NO SWING'} isStatus />
                    </>
                  )}

                  {selectedExercise === 'Shoulder Press' && (
                    <>
                      <MetricRow label="Elbow Angle" value={`${metrics.elbow_angle || 0}°`} />
                      <MetricRow label="Extension Status" value={metrics.extension_status || 'FULL EXTENSION'} isStatus />
                      <MetricRow label="Back Arch Status" value={metrics.back_arch_status || 'NORMAL'} isStatus />
                    </>
                  )}

                  {selectedExercise === 'Lunges' && (
                    <>
                      <MetricRow label="Front Knee Angle" value={`${metrics.front_knee_angle || 0}°`} />
                      <MetricRow label="Torso Angle" value={`${metrics.torso_angle || 0}°`} />
                      <MetricRow label="Balance Status" value={metrics.balance_status || 'BALANCED'} isStatus />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricRow = ({ label, value, isStatus }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{label}</span>
    <span style={{ fontSize: '0.95rem', fontWeight: '700', color: isStatus ? 'var(--primary-accent)' : '#fff' }}>
      {value}
    </span>
  </div>
);

export default WorkoutPage;

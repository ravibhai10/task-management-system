import React, { useState, useEffect, useContext, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, AlertCircle } from 'lucide-react';
import { AuthContext } from '../AuthContext';

export default function TimeTracker({ task, onTimeUpdate }) {
  const [timeLeft, setTimeLeft] = useState(task.timeLimit * 60); // Convert minutes to seconds
  const [isRunning, setIsRunning] = useState(false);
  const [customDuration, setCustomDuration] = useState(120); // Default 2 hours in minutes
  const [showCustomTimer, setShowCustomTimer] = useState(false);
  const [logMinutesInput, setLogMinutesInput] = useState('');
  const { user } = useContext(AuthContext);
  const sessionStartRef = useRef(null);
  const accumulatedRef = useRef(0); // seconds accumulated but not yet logged

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          const newTime = time - 1;
          if (newTime === 0) {
            setIsRunning(false);
            // When timer reaches zero, stop and log any accumulated minutes
            // Notify when time is up
            try {
              new Notification('Time is up!', {
                body: `Your time for task "${task.title}" has ended.`,
                icon: '/favicon.ico'
              });
            } catch (e) {
              // Notifications may not be available; ignore
            }
            // record any accumulated minutes from this session
            const sessionDelta = sessionStartRef.current ? Math.floor((Date.now() - sessionStartRef.current) / 1000) : 0;
            accumulatedRef.current += sessionDelta;
            sessionStartRef.current = null;
            const minutesToLog = Math.floor(accumulatedRef.current / 60);
            if (minutesToLog > 0 && onTimeUpdate) {
              onTimeUpdate && onTimeUpdate(task.id, newTime, minutesToLog);
              accumulatedRef.current -= minutesToLog * 60;
            }
          }
          // Update parent component with time progress
          onTimeUpdate && onTimeUpdate(task.id, newTime);
          return newTime;
        });
      }, 1000);
    } else if (!isRunning && interval) {
      clearInterval(interval);
    }
    return () => interval && clearInterval(interval);
  }, [isRunning, timeLeft, task.id, task.title, onTimeUpdate]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    if (!isRunning) {
      // Request notification permission if not granted
      if (Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
      // mark session start
      sessionStartRef.current = Date.now();
    }
    if (isRunning) {
      // we're pausing -> accumulate seconds and log full minutes
      const sessionDelta = sessionStartRef.current ? Math.floor((Date.now() - sessionStartRef.current) / 1000) : 0;
      accumulatedRef.current += sessionDelta;
      sessionStartRef.current = null;
      const minutesToLog = Math.floor(accumulatedRef.current / 60);
      if (minutesToLog > 0 && onTimeUpdate) {
        onTimeUpdate && onTimeUpdate(task.id, timeLeft, minutesToLog);
        accumulatedRef.current -= minutesToLog * 60;
      }
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    // on reset, log any accumulated minutes
    const sessionDelta = sessionStartRef.current ? Math.floor((Date.now() - sessionStartRef.current) / 1000) : 0;
    accumulatedRef.current += sessionDelta;
    sessionStartRef.current = null;
    const minutesToLog = Math.floor(accumulatedRef.current / 60);
    if (minutesToLog > 0 && onTimeUpdate) {
      onTimeUpdate && onTimeUpdate(task.id, timeLeft, minutesToLog);
      accumulatedRef.current -= minutesToLog * 60;
    }
    setIsRunning(false);
    setTimeLeft(task.timeLimit * 60);
  };

  const handleCustomDurationChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setCustomDuration(value);
    }
  };

  const startCustomTimer = () => {
    setTimeLeft(customDuration * 60);
    setShowCustomTimer(false);
    setIsRunning(true);
    sessionStartRef.current = Date.now();
  };

  const baseLimit = (task.timeLimit && task.timeLimit > 0) ? task.timeLimit * 60 : 1;
  const progressPercentage = Math.max(0, Math.min(100, (timeLeft / baseLimit) * 100));
  const isAlmostDone = progressPercentage < 20;

  return (
    <div className="time-tracker">
      <div className="time-display">
        <div className="time-progress" style={{ width: `${progressPercentage}%` }} />
        <span className={`time ${isAlmostDone ? 'almost-done' : ''}`}>
          {formatTime(timeLeft)}
        </span>
      </div>
      
      <div className="timer-controls">
        <button 
          className={`timer-btn ${isRunning ? 'pause' : 'play'}`}
          onClick={handleStartStop}
        >
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button className="timer-btn reset" onClick={handleReset}>
          <RotateCcw size={20} />
        </button>
        <button 
          className="timer-btn custom"
          onClick={() => setShowCustomTimer(!showCustomTimer)}
        >
          <Clock size={20} />
        </button>
      </div>

      {showCustomTimer && (
        <div className="custom-timer-popup">
          <h4>Set Custom Duration</h4>
          <div className="custom-timer-input">
            <input
              type="number"
              min="1"
              max="480"
              value={customDuration}
              onChange={handleCustomDurationChange}
            />
            <span>minutes</span>
          </div>
          <div className="custom-timer-presets">
            <button onClick={() => setCustomDuration(120)}>2h</button>
            <button onClick={() => setCustomDuration(180)}>3h</button>
            <button onClick={() => setCustomDuration(240)}>4h</button>
          </div>
          <button 
            className="btn btn-primary"
            onClick={startCustomTimer}
          >
            Start Timer
          </button>
        </div>
      )}

      <div className="manual-log">
        <label style={{marginRight:8}}>Log minutes:</label>
        <input
          type="number"
          min="1"
          placeholder="minutes"
          value={logMinutesInput}
          onChange={(e) => setLogMinutesInput(e.target.value)}
          style={{width:80, marginRight:8}}
        />
        <button
          className="btn"
          onClick={() => {
            const m = parseInt(logMinutesInput, 10) || 0;
            if (m > 0 && onTimeUpdate) {
              onTimeUpdate && onTimeUpdate(task.id, timeLeft, m);
              setLogMinutesInput('');
            }
          }}
        >Log</button>
      </div>

      {isAlmostDone && (
        <div className="time-warning">
          <AlertCircle size={16} />
          <span>Time is almost up!</span>
        </div>
      )}
    </div>
  );
}
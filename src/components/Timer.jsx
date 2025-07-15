import React from 'react';
import './Timer.css';

const Timer = ({ 
  whiteTime, 
  blackTime, 
  currentPlayer, 
  timerMode, 
  isGameActive,
  onTimeout 
}) => {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (time, player) => {
    if (time <= 30) return 'red'; // Less than 30 seconds
    if (time <= 60) return 'orange'; // Less than 1 minute
    if (currentPlayer === player && isGameActive) return 'green'; // Active player
    return 'white'; // Default
  };

  const isActivePlayer = (player) => {
    return currentPlayer === player && isGameActive;
  };

  if (timerMode === 'none') {
    return null;
  }

  return (
    <div className="timer-container">
      <div className="timer-section">
        <div className="timer-label">Black</div>
        <div 
          className={`timer-display ${isActivePlayer('b') ? 'active' : ''}`}
          style={{ color: getTimeColor(blackTime, 'b') }}
        >
          {formatTime(blackTime)}
        </div>
      </div>
      
      <div className="timer-divider">vs</div>
      
      <div className="timer-section">
        <div className="timer-label">White</div>
        <div 
          className={`timer-display ${isActivePlayer('w') ? 'active' : ''}`}
          style={{ color: getTimeColor(whiteTime, 'w') }}
        >
          {formatTime(whiteTime)}
        </div>
      </div>
    </div>
  );
};

export default Timer; 
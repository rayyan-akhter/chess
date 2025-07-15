import React, { useState } from 'react';
import './Homepage.css';

const Homepage = ({ onStartGame }) => {
  const [selectedMode, setSelectedMode] = useState(null);
  const [playerColor, setPlayerColor] = useState('white');
  const [aiDifficulty, setAiDifficulty] = useState('medium');

  const handleStartGame = () => {
    if (selectedMode) {
      onStartGame({
        mode: selectedMode,
        playerColor: selectedMode === 'ai' ? playerColor : 'white',
        aiDifficulty: selectedMode === 'ai' ? aiDifficulty : 'medium'
      });
    }
  };

  return (
    <div className="homepage">
      <div className="homepage-container">
        <div className="header">
          <h1 className="title">♔ Chess Master ♔</h1>
          <p className="subtitle">Choose your game mode and start playing!</p>
        </div>

        <div className="game-modes">
          <div className="mode-section">
            <h2>Select Game Mode</h2>
            
            <div className="mode-options">
              <div 
                className={`mode-card ${selectedMode === 'ai' ? 'selected' : ''}`}
                onClick={() => setSelectedMode('ai')}
              >
                <div className="mode-icon">🤖</div>
                <h3>Play vs Computer</h3>
                <p>Challenge our AI opponent with adjustable difficulty levels</p>
              </div>

              <div 
                className={`mode-card ${selectedMode === '2player' ? 'selected' : ''}`}
                onClick={() => setSelectedMode('2player')}
              >
                <div className="mode-icon">👥</div>
                <h3>2 Players</h3>
                <p>Play chess with a friend on the same device</p>
              </div>
            </div>
          </div>

          {selectedMode === 'ai' && (
            <div className="settings-section">
              <h2>AI Settings</h2>
              
              <div className="setting-group">
                <label>Choose Your Color:</label>
                <div className="color-options">
                  <button 
                    className={`color-btn ${playerColor === 'white' ? 'selected' : ''}`}
                    onClick={() => setPlayerColor('white')}
                  >
                    <span className="piece">♔</span> White
                  </button>
                  <button 
                    className={`color-btn ${playerColor === 'black' ? 'selected' : ''}`}
                    onClick={() => setPlayerColor('black')}
                  >
                    <span className="piece">♚</span> Black
                  </button>
                </div>
              </div>

              <div className="setting-group">
                <label>AI Difficulty:</label>
                <select 
                  value={aiDifficulty} 
                  onChange={(e) => setAiDifficulty(e.target.value)}
                  className="difficulty-select"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
          )}

          {selectedMode && (
            <div className="start-section">
              <button 
                className="start-btn"
                onClick={handleStartGame}
              >
                {selectedMode === 'ai' ? 'Start Game vs AI' : 'Start 2-Player Game'}
              </button>
            </div>
          )}
        </div>

        <div className="features">
          <h2>Game Features</h2>
          <div className="features-grid">
            <div className="feature">
              <span className="feature-icon">♟️</span>
              <h4>Complete Chess Rules</h4>
              <p>All standard chess moves including castling, en passant, and pawn promotion</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🎯</span>
              <h4>Smart AI</h4>
              <p>Powered by Gemini AI with multiple difficulty levels</p>
            </div>
            <div className="feature">
              <span className="feature-icon">📊</span>
              <h4>Move History</h4>
              <p>Track all moves and captured pieces</p>
            </div>
            <div className="feature">
              <span className="feature-icon">↩️</span>
              <h4>Undo Moves</h4>
              <p>Go back and try different strategies</p>
            </div>
            <div className="feature">
              <span className="feature-icon">⚡</span>
              <h4>Real-time Check</h4>
              <p>Visual indicators for check and checkmate</p>
            </div>
            <div className="feature">
              <span className="feature-icon">🎨</span>
              <h4>Beautiful UI</h4>
              <p>Modern, responsive design with smooth animations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage; 
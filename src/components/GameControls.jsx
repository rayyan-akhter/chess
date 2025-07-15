import React from 'react';
import './GameControls.css';

const GameControls = ({
  gameState,
  currentPlayer,
  moveHistory,
  aiEnabled,
  aiDifficulty,
  gameMode = '2player',
  timerMode = 'none',
  onNewGame,
  onUndoMove,
  onToggleAI,
  onSetAIDifficulty,
  onSetPlayerColor,
  onSetTimerMode
}) => {
  const getGameStatusText = () => {
    switch (gameState) {
      case 'checkmate':
        return `Checkmate! ${currentPlayer === 'w' ? 'Black' : 'White'} wins!`;
      case 'stalemate':
        return 'Stalemate! It\'s a draw!';
      case 'check':
        return `${currentPlayer === 'w' ? 'White' : 'Black'} is in check!`;
      default:
        return `${currentPlayer === 'w' ? 'White' : 'Black'}'s turn`;
    }
  };

  const getStatusClass = () => {
    switch (gameState) {
      case 'checkmate':
        return 'status-checkmate';
      case 'stalemate':
        return 'status-stalemate';
      case 'check':
        return 'status-check';
      default:
        return 'status-playing';
    }
  };

  const formatMove = (move) => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    
    const fromSquare = `${files[move.from.col]}${ranks[move.from.row]}`;
    const toSquare = `${files[move.to.col]}${ranks[move.to.row]}`;
    
    let moveText = fromSquare + toSquare;
    
    if (move.isCastling) {
      moveText = move.side === 'kingside' ? 'O-O' : 'O-O-O';
    } else if (move.captured) {
      moveText = `${fromSquare}x${toSquare}`;
    }
    
    return moveText;
  };

  return (
    <div className="game-controls">
      <div className="game-status">
        <h3>Game Status</h3>
        <div className={`status ${getStatusClass()}`}>
          {getGameStatusText()}
        </div>
      </div>

      <div className="game-settings">
        <h3>Game Settings</h3>
        
        {gameMode === 'ai' && (
          <>
            <div className="setting-group">
              <label>Player Color:</label>
              <select 
                value={currentPlayer === 'w' ? 'white' : 'black'} 
                onChange={(e) => onSetPlayerColor(e.target.value === 'white' ? 'w' : 'b')}
                disabled={moveHistory.length > 0}
              >
                <option value="white">White</option>
                <option value="black">Black</option>
              </select>
            </div>

            <div className="setting-group">
              <label>AI Difficulty:</label>
              <select 
                value={aiDifficulty} 
                onChange={(e) => onSetAIDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </>
        )}

        <div className="setting-group">
          <label>Timer Mode:</label>
          <select 
            value={timerMode} 
            onChange={(e) => onSetTimerMode(e.target.value)}
            disabled={moveHistory.length > 0}
          >
            <option value="none">No Timer</option>
            <option value="10min">10 Minutes</option>
            <option value="15min">15 Minutes</option>
            <option value="30min">30 Minutes</option>
          </select>
        </div>

        {gameMode === '2player' && (
          <div className="setting-group">
            <label>Current Turn:</label>
            <div className="current-turn">
              <span className={`turn-indicator ${currentPlayer === 'w' ? 'white' : 'black'}`}>
                {currentPlayer === 'w' ? '♔ White' : '♚ Black'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="game-actions">
        <h3>Actions</h3>
        <button 
          className="btn btn-primary" 
          onClick={onNewGame}
        >
          New Game
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={onUndoMove}
          disabled={moveHistory.length === 0}
        >
          Undo Move
        </button>
      </div>

      <div className="move-history">
        <h3>Move History</h3>
        <div className="history-list">
          {moveHistory.length === 0 ? (
            <p className="no-moves">No moves yet</p>
          ) : (
            moveHistory.map((move, index) => (
              <div key={index} className="move-entry">
                <span className="move-number">{Math.floor(index / 2) + 1}.</span>
                <span className="move-text">{formatMove(move)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GameControls; 
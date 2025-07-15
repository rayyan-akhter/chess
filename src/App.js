import React, { useState } from "react";
import "./App.css";
import Board from "./components/board/Board";
import Homepage from "./components/Homepage";

function App() {
  const [gameState, setGameState] = useState('homepage'); // 'homepage' or 'game'
  const [gameSettings, setGameSettings] = useState(null);

  const handleStartGame = (settings) => {
    setGameSettings(settings);
    setGameState('game');
  };

  const handleBackToHome = () => {
    setGameState('homepage');
    setGameSettings(null);
  };

  return (
    <div className="App">
      {gameState === 'homepage' ? (
        <Homepage onStartGame={handleStartGame} />
      ) : (
        <div className="game-container">
          <button className="back-btn" onClick={handleBackToHome}>
            ← Back to Home
          </button>
          <Board 
            gameMode={gameSettings?.mode}
            playerColor={gameSettings?.playerColor}
            aiDifficulty={gameSettings?.aiDifficulty}
          />
        </div>
      )}
    </div>
  );
}

export default App;

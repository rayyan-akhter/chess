import React, { useRef, useState, useEffect, useCallback } from "react";
import Cell from "../Cell";
import GameControls from "../GameControls";
import Notification from "../Notification";
import "./style.css";
import { PIECESIMAGES, INITIALBOARD, GAME_STATES, COLORS } from "./boardconstant";
import ChessService from "../../services/chessService";
import AIService from "../../services/aiService";

const Board = ({ gameMode = '2player', playerColor: initialPlayerColor = 'white', aiDifficulty: initialAIDifficulty = 'medium' }) => {
  const [board, setBoard] = useState(INITIALBOARD);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [capturedPieces, setCapturedPieces] = useState({ white: [], black: [] });
  const [currentPlayer, setCurrentPlayer] = useState(COLORS.WHITE);
  const [gameState, setGameState] = useState(GAME_STATES.PLAYING);
  const [promotion, setPromotion] = useState({
    active: false,
    rowIndex: null,
    colIndex: null,
    color: null,
  });

  // Previous move tracking
  const [previousMove, setPreviousMove] = useState(null);

  // AI and game settings
  const [aiEnabled, setAiEnabled] = useState(gameMode === 'ai');
  const [aiDifficulty, setAiDifficulty] = useState(initialAIDifficulty);
  const [playerColor, setPlayerColor] = useState(initialPlayerColor === 'white' ? COLORS.WHITE : COLORS.BLACK);
  const [isAITurn, setIsAITurn] = useState(false);
  
  // Notifications
  const [notification, setNotification] = useState(null);
  
  // Services
  const chessService = useRef(new ChessService());
  const aiService = useRef(null);
  
  // Initialize AI service
  useEffect(() => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY || 'your-api-key-here';
    aiService.current = new AIService(apiKey);
    
    // Test AI functionality
    import('../../testAI').then(module => {
      module.default();
    });
    
    if (!process.env.REACT_APP_GEMINI_API_KEY) {
      setNotification({
        message: '🔧 Demo Mode: AI is running with smart random moves. Add your Gemini API key for full AI functionality.',
        type: 'info'
      });
    }
  }, []);

  const executeMove = useCallback((fromRow, fromCol, toRow, toCol, moveData = {}) => {
    const piece = board[fromRow][fromCol];
    const capturedPiece = board[toRow][toCol];
    
    // Update captured pieces
    if (capturedPiece) {
      setCapturedPieces(prev => ({
        ...prev,
        [capturedPiece[1] === 'w' ? 'white' : 'black']: [
          ...prev[capturedPiece[1] === 'w' ? 'white' : 'black'],
          capturedPiece,
        ],
      }));
    }

    // Execute move using chess service
    const newBoard = chessService.current.executeMove(board, fromRow, fromCol, toRow, toCol, moveData);
    setBoard(newBoard);

    // Update previous move
    setPreviousMove({
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol }
    });

    // Handle pawn promotion
    if (piece[0].toUpperCase() === 'P' && 
        ((piece[1] === 'w' && toRow === 0) || (piece[1] === 'b' && toRow === 7))) {
      setPromotion({ active: true, rowIndex: toRow, colIndex: toCol, color: piece[1] });
      setSelectedPiece(null);
      setPossibleMoves([]);
      removeHighlightClass();
      return;
    }

    // Switch turns
    setCurrentPlayer(currentPlayer === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE);
    setSelectedPiece(null);
    setPossibleMoves([]);
    removeHighlightClass();
  }, [board, currentPlayer]);

  const makeAIMove = useCallback(async () => {
    console.log('🤖 AI turn started...');
    console.log('Current player:', currentPlayer);
    console.log('AI enabled:', aiEnabled);
    console.log('Player color:', playerColor);
    
    if (!aiService.current) {
      console.log('❌ AI service not available');
      setIsAITurn(false);
      return;
    }
    
    try {
      console.log('🔄 Generating AI move...');
      const aiMove = await aiService.current.getAIMove(board, currentPlayer, aiDifficulty);
      console.log('AI move result:', aiMove);
      
      if (aiMove) {
        console.log('✅ Executing AI move:', aiMove);
        executeMove(aiMove.fromRow, aiMove.fromCol, aiMove.toRow, aiMove.toCol, aiMove);
      } else {
        console.log('❌ No AI move generated');
      }
    } catch (error) {
      console.error('❌ AI move failed:', error);
    } finally {
      console.log('🏁 AI turn finished');
      setIsAITurn(false);
    }
  }, [board, currentPlayer, aiDifficulty, aiEnabled, playerColor, executeMove]);



  // Check game state after each move
  useEffect(() => {
    const newGameState = chessService.current.getGameState(board, currentPlayer);
    setGameState(newGameState);
    
    // Clear previous notifications
    setNotification(null);
    
    // Show game end notifications
    if (newGameState === GAME_STATES.CHECKMATE) {
      setNotification({
        message: `🎉 Checkmate! ${currentPlayer === 'w' ? 'Black' : 'White'} wins!`,
        type: 'success'
      });
    } else if (newGameState === GAME_STATES.STALEMATE) {
      setNotification({
        message: '🤝 Stalemate! The game is a draw.',
        type: 'warning'
      });
    } else if (newGameState === GAME_STATES.CHECK) {
      setNotification({
        message: `⚠️ ${currentPlayer === 'w' ? 'White' : 'Black'} is in check!`,
        type: 'warning'
      });
    }
    
    // If game is over, don't allow AI to move
    if (newGameState === GAME_STATES.CHECKMATE || newGameState === GAME_STATES.STALEMATE) {
      setIsAITurn(false);
      return;
    }
    
    // AI turn logic
    console.log('🔄 Checking AI turn logic...');
    console.log('AI enabled:', aiEnabled);
    console.log('Current player:', currentPlayer);
    console.log('Player color:', playerColor);
    console.log('Is AI turn:', isAITurn);
    
    if (aiEnabled && currentPlayer !== playerColor && !isAITurn) {
      console.log('✅ Starting AI turn...');
      setIsAITurn(true);
      setTimeout(() => {
        makeAIMove();
      }, 500);
    } else {
      console.log('❌ AI turn conditions not met');
    }
  }, [board, currentPlayer, aiEnabled, playerColor, isAITurn, makeAIMove]);

  const selectPiece = (rowIndex, colIndex) => {
    // Don't allow moves during AI turn or if game is over
    if (isAITurn || gameState === GAME_STATES.CHECKMATE || gameState === GAME_STATES.STALEMATE) {
      return;
    }
    
    // Don't allow AI pieces to be selected by player (only in AI mode)
    if (gameMode === 'ai' && aiEnabled && currentPlayer !== playerColor) {
      return;
    }

    const piece = board[rowIndex][colIndex];

    // If a piece is already selected, try to move
    if (selectedPiece) {
      const isMoveAllowed = possibleMoves.some(
        (move) => move.x === rowIndex && move.y === colIndex
      );

      if (isMoveAllowed) {
        const moveData = possibleMoves.find(
          (move) => move.x === rowIndex && move.y === colIndex
        );
        executeMove(selectedPiece.rowIndex, selectedPiece.colIndex, rowIndex, colIndex, moveData);
        return;
      }

      // If clicking on same color piece, select it instead
      const isSameColor = piece && selectedPiece.piece && piece[1] === selectedPiece.piece[1];
      if (isSameColor) {
        setSelectedPiece({ piece, rowIndex, colIndex });
        removeHighlightClass();
        const moves = chessService.current.getPossibleMoves(board, rowIndex, colIndex);
        setPossibleMoves(moves);
        highlightMoves(moves);
        return;
      }

      // Deselect current piece
      removeHighlightClass();
      setSelectedPiece(null);
      setPossibleMoves([]);
    }

    // Select new piece if it belongs to current player
    if (piece && piece[1] === currentPlayer) {
      setSelectedPiece({ piece, rowIndex, colIndex });
      const moves = chessService.current.getPossibleMoves(board, rowIndex, colIndex);
      setPossibleMoves(moves);
      highlightMoves(moves);
    }
  };



  const highlightMoves = (moves) => {
    moves.forEach((move) => {
      const { x, y } = move;
      const cell = document.getElementById(`${x}-${y}`);
      if (cell) {
      cell.classList.add("highlight");
      }
    });
  };

  const removeHighlightClass = () => {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const element = document.getElementById(`${x}-${y}`);
        if (element) {
          element.classList.remove("highlight");
        }
      }
    }
  };

  const pawnPromotion = (newPiece) => {
    const { rowIndex, colIndex, color } = promotion;
    const promotedPiece = newPiece + color;
    const newBoard = board.map((row) => row.slice());
    newBoard[rowIndex][colIndex] = promotedPiece;
    setBoard(newBoard);
    setPromotion({
      active: false,
      rowIndex: null,
      colIndex: null,
      color: null,
    });
    
    // Switch turns after promotion
    setCurrentPlayer(currentPlayer === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE);
  };

  const newGame = () => {
    setBoard(INITIALBOARD);
    setSelectedPiece(null);
    setPossibleMoves([]);
    setCapturedPieces({ white: [], black: [] });
    setCurrentPlayer(COLORS.WHITE);
    setGameState(GAME_STATES.PLAYING);
    setPromotion({ active: false, rowIndex: null, colIndex: null, color: null });
    setPreviousMove(null);
    setIsAITurn(false);
    setNotification(null);
    removeHighlightClass();
    
    // Reset chess service
    chessService.current = new ChessService();
  };

  const undoMove = () => {
    const history = chessService.current.moveHistory;
    if (history.length === 0) return;
    
    // Remove last move from history
    history.pop();
    
    // Reconstruct board from remaining history
    const newBoard = chessService.current.reconstructBoardFromHistory(history);
    
    // Update captured pieces
    const newCapturedPieces = { white: [], black: [] };
    history.forEach(move => {
      if (move.captured) {
        const color = move.captured[1] === 'w' ? 'white' : 'black';
        newCapturedPieces[color].push(move.captured);
      }
    });
    
    setBoard(newBoard);
    setCapturedPieces(newCapturedPieces);
    setCurrentPlayer(currentPlayer === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE);
    setSelectedPiece(null);
    setPossibleMoves([]);
    
    // Update previous move based on history
    if (history.length > 0) {
      const previousLastMove = history[history.length - 1];
      setPreviousMove({
        from: previousLastMove.from,
        to: previousLastMove.to
      });
    } else {
      setPreviousMove(null);
    }
    
    setNotification(null);
    removeHighlightClass();
  };

  const toggleAI = () => {
    setAiEnabled(!aiEnabled);
    if (!aiEnabled) {
      // If enabling AI and it's AI's turn, make AI move
      if (currentPlayer !== playerColor) {
        setIsAITurn(true);
      }
    } else {
      setIsAITurn(false);
    }
  };

  const setAIDifficulty = (difficulty) => {
    setAiDifficulty(difficulty);
  };

  const handleSetPlayerColor = (color) => {
    setPlayerColor(color);
    // If AI is enabled and it's now AI's turn, make AI move
    if (aiEnabled && currentPlayer !== color) {
      setIsAITurn(true);
    }
  };



  // Check if a specific king is in check
  const isKingInCheck = (rowIndex, colIndex, piece) => {
    if (!piece || piece[0].toUpperCase() !== 'K') return false;
    const kingColor = piece[1];
    return chessService.current.isKingInCheck(board, kingColor);
  };

  return (
    <div className="chess-container">
      <Notification 
        message={notification?.message} 
        type={notification?.type} 
        onClose={() => setNotification(null)} 
      />
      <div className="captured-pieces captured-black">
        {capturedPieces.black.map((piece, index) => (
          <img
            key={index}
            src={`${process.env.PUBLIC_URL}/assets/${piece}.png`}
            alt={piece}
            className="captured-piece"
          />
        ))}
      </div>
      
      <div className="game-board-section">
        <div className="chessBoard">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((piece, colIndex) => (
              <Cell
                  key={`${rowIndex}-${colIndex}`}
                piece={piece}
                rowIndex={rowIndex}
                colIndex={colIndex}
                isSelected={
                  selectedPiece &&
                  selectedPiece.rowIndex === rowIndex &&
                  selectedPiece.colIndex === colIndex
                }
                onClick={() => selectPiece(rowIndex, colIndex)}
                  isInCheck={isKingInCheck(rowIndex, colIndex, piece)}
                  isPreviousMove={
                    previousMove &&
                    ((previousMove.from.row === rowIndex && previousMove.from.col === colIndex) ||
                     (previousMove.to.row === rowIndex && previousMove.to.col === colIndex))
                  }
              />
            ))}
          </div>
        ))}
          
        {promotion.active && (
          <div className="promotion-modal">
            <div className="promotion-options">
              <img
                src={
                  promotion.color === "w"
                    ? PIECESIMAGES.whiteQueen
                      : PIECESIMAGES.blackQueen
                }
                alt="Queen"
                onClick={() => pawnPromotion("Q")}
              />
              <img
                src={
                  promotion.color === "w"
                      ? PIECESIMAGES.whiteRook
                      : PIECESIMAGES.blackRook
                }
                alt="Rook"
                onClick={() => pawnPromotion("R")}
              />
              <img
                src={
                  promotion.color === "w"
                      ? PIECESIMAGES.whiteBishop
                      : PIECESIMAGES.blackBishop
                }
                alt="Bishop"
                onClick={() => pawnPromotion("B")}
              />
              <img
                src={
                  promotion.color === "w"
                      ? PIECESIMAGES.whiteKnight
                      : PIECESIMAGES.blackKnight
                }
                alt="Knight"
                onClick={() => pawnPromotion("N")}
              />
            </div>
          </div>
        )}
      </div>
      </div>
      
      <div className="captured-pieces captured-white">
        {capturedPieces.white.map((piece, index) => (
          <img
            key={index}
            src={`${process.env.PUBLIC_URL}/assets/${piece}.png`}
            alt={piece}
            className="captured-piece"
          />
        ))}
      </div>
      
      <GameControls
        gameState={gameState}
        currentPlayer={currentPlayer}
        moveHistory={chessService.current.moveHistory}
        aiEnabled={aiEnabled}
        aiDifficulty={aiDifficulty}
        gameMode={gameMode}
        onNewGame={newGame}
        onUndoMove={undoMove}
        onToggleAI={toggleAI}
        onSetAIDifficulty={setAIDifficulty}
        onSetPlayerColor={handleSetPlayerColor}
      />
    </div>
  );
};

export default Board;

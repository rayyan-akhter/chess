import { GoogleGenerativeAI } from '@google/generative-ai';
import ChessService from './chessService';

export class AIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
    this.model = this.genAI ? this.genAI.getGenerativeModel({ model: "gemini-pro" }) : null;
    this.demoMode = !apiKey || apiKey === 'your-api-key-here';
    this.chessService = new ChessService();
  }

  // Convert board to FEN-like string for AI
  boardToFEN(board) {
    let fen = '';
    let emptyCount = 0;
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece === '') {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }
          // Convert piece notation to FEN
          const pieceType = piece[0].toUpperCase();
          const pieceColor = piece[1];
          const fenPiece = pieceColor === 'w' ? pieceType : pieceType.toLowerCase();
          fen += fenPiece;
        }
      }
      if (emptyCount > 0) {
        fen += emptyCount;
        emptyCount = 0;
      }
      if (row < 7) fen += '/';
    }
    
    return fen;
  }

  // Convert FEN to board
  fenToBoard(fen) {
    const board = Array(8).fill().map(() => Array(8).fill(''));
    const rows = fen.split('/');
    
    for (let row = 0; row < 8; row++) {
      let col = 0;
      for (let char of rows[row]) {
        if (char >= '1' && char <= '8') {
          col += parseInt(char);
        } else {
          const isWhite = char === char.toUpperCase();
          const pieceType = char.toUpperCase();
          const color = isWhite ? 'w' : 'b';
          board[row][col] = pieceType + color;
          col++;
        }
      }
    }
    
    return board;
  }

  // Get AI move using Gemini or demo mode
  async getAIMove(board, aiColor, difficulty = 'medium') {
    if (this.demoMode) {
      // Demo mode - use smart random moves
      return this.getSmartRandomMove(board, aiColor, difficulty);
    }
    
    try {
      const fen = this.boardToFEN(board);
      const prompt = this.createPrompt(fen, aiColor, difficulty);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse AI response to extract move
      const move = this.parseAIMove(text, board, aiColor);
      return move;
    } catch (error) {
      console.error('AI move generation failed:', error);
      // Fallback to smart random move
      return this.getSmartRandomMove(board, aiColor, difficulty);
    }
  }

  // Smart random move generator for demo mode
  getSmartRandomMove(board, aiColor, difficulty) {
    const allMoves = [];
    const captureMoves = [];
    const checkMoves = [];
    
    // Get all valid moves for AI pieces using chess service
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece[1] === aiColor) {
          const moves = this.chessService.getPossibleMoves(board, row, col);
          moves.forEach(move => {
            const moveData = {
              fromRow: row,
              fromCol: col,
              toRow: move.x,
              toCol: move.y,
              ...move // Include any additional move data (isCastling, isEnPassant, etc.)
            };
            
            allMoves.push(moveData);
            
            // Check if it's a capture
            const targetPiece = board[move.x][move.y];
            if (targetPiece && targetPiece[1] !== aiColor) {
              captureMoves.push(moveData);
            }
            
            // Check if it's a check move (simplified check)
            const tempBoard = this.chessService.makeMove(board, row, col, move.x, move.y);
            if (this.chessService.isKingInCheck(tempBoard, aiColor === 'w' ? 'b' : 'w')) {
              checkMoves.push(moveData);
            }
          });
        }
      }
    }
    
    if (allMoves.length === 0) return null;
    
    // Choose move based on difficulty and priority
    let selectedMoves = allMoves;
    
    if (difficulty === 'hard' && checkMoves.length > 0) {
      selectedMoves = checkMoves;
    } else if (difficulty !== 'easy' && captureMoves.length > 0) {
      selectedMoves = captureMoves;
    }
    
    // Add some randomness based on difficulty
    const randomFactor = difficulty === 'easy' ? 0.8 : 
                        difficulty === 'medium' ? 0.5 : 0.2;
    
    if (Math.random() < randomFactor) {
      selectedMoves = allMoves;
    }
    
    return selectedMoves[Math.floor(Math.random() * selectedMoves.length)];
  }

  // Create prompt for AI
  createPrompt(fen, aiColor, difficulty) {
    const colorName = aiColor === 'w' ? 'white' : 'black';
    const difficultyLevel = difficulty === 'easy' ? 'beginner' : 
                           difficulty === 'medium' ? 'intermediate' : 'advanced';
    
    return `You are playing chess as ${colorName} pieces. The current board position in FEN notation is: ${fen}

Your task is to analyze the position and suggest the best move for ${colorName}. Consider:
- Material value
- Position control
- King safety
- Development
- Tactical opportunities

Respond with ONLY the move in algebraic notation (e.g., "e4", "Nf3", "O-O" for castling, "exd5" for captures).
If you see a checkmate opportunity, prioritize it.
If you see a tactical advantage, take it.
Play at a ${difficultyLevel} level.

Current position: ${fen}
Your color: ${colorName}
Your move:`;
  }

  // Parse AI response to extract move
  parseAIMove(aiResponse, board, aiColor) {
    // Clean the response
    const cleanResponse = aiResponse.trim().replace(/[^\w\-x=+#]/g, '');
    
    // Try to find a valid move in the response
    const movePatterns = [
      /([a-h][1-8])/g,  // e4, d5, etc.
      /([KQRBNP][a-h][1-8])/g,  // Nf3, Be4, etc.
      /([a-h]x[a-h][1-8])/g,  // exd5, etc.
      /([KQRBNP]x[a-h][1-8])/g,  // Nxe4, etc.
      /O-O/g,  // Kingside castling
      /O-O-O/g  // Queenside castling
    ];
    
    for (const pattern of movePatterns) {
      const matches = cleanResponse.match(pattern);
      if (matches) {
        const move = matches[0];
        const parsedMove = this.parseAlgebraicMove(move, board, aiColor);
        if (parsedMove) {
          // Validate the move using chess service
          const validMoves = this.chessService.getPossibleMoves(board, parsedMove.fromRow, parsedMove.fromCol);
          const isValid = validMoves.some(validMove => 
            validMove.x === parsedMove.toRow && validMove.y === parsedMove.toCol
          );
          
          if (isValid) {
            return parsedMove;
          }
        }
      }
    }
    
    // If parsing fails, return smart random move
    return this.getSmartRandomMove(board, aiColor, 'medium');
  }

  // Parse algebraic notation to board coordinates
  parseAlgebraicMove(algebraicMove, board, aiColor) {
    const move = algebraicMove.toLowerCase();
    
    // Handle castling
    if (move === 'o-o' || move === '0-0') {
      return this.findCastlingMove(board, aiColor, 'kingside');
    }
    if (move === 'o-o-o' || move === '0-0-0') {
      return this.findCastlingMove(board, aiColor, 'queenside');
    }
    
    // Handle regular moves
    const pieceType = this.getPieceTypeFromMove(move);
    const targetSquare = this.getTargetSquareFromMove(move);
    
    if (!targetSquare) return null;
    
    // Find the piece that can make this move
    const piece = this.findPieceForMove(board, pieceType, targetSquare, aiColor);
    if (!piece) return null;
    
    return {
      fromRow: piece.row,
      fromCol: piece.col,
      toRow: targetSquare.row,
      toCol: targetSquare.col
    };
  }

  // Get piece type from algebraic move
  getPieceTypeFromMove(move) {
    if (move.startsWith('k')) return 'K';
    if (move.startsWith('q')) return 'Q';
    if (move.startsWith('r')) return 'R';
    if (move.startsWith('b')) return 'B';
    if (move.startsWith('n')) return 'N';
    return 'P'; // Default to pawn
  }

  // Get target square from algebraic move
  getTargetSquareFromMove(move) {
    const fileMatch = move.match(/[a-h]/g);
    const rankMatch = move.match(/[1-8]/g);
    
    if (!fileMatch || !rankMatch) return null;
    
    const file = fileMatch[fileMatch.length - 1];
    const rank = rankMatch[rankMatch.length - 1];
    
    return {
      row: 8 - parseInt(rank),
      col: file.charCodeAt(0) - 'a'.charCodeAt(0)
    };
  }

  // Find piece that can make the specified move
  findPieceForMove(board, pieceType, targetSquare, aiColor) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece[1] === aiColor && piece[0].toUpperCase() === pieceType) {
          // Check if this piece can move to target square
          if (this.canPieceMoveTo(board, row, col, targetSquare.row, targetSquare.col)) {
            return { row, col };
          }
        }
      }
    }
    return null;
  }

  // Check if piece can move to target square
  canPieceMoveTo(board, fromRow, fromCol, toRow, toCol) {
    const piece = board[fromRow][fromCol];
    if (!piece) return false;
    
    const type = piece[0].toUpperCase();
    const color = piece[1];
    
    // Simple validation - check if target square is reachable
    switch (type) {
      case 'P':
        return this.isValidPawnMove(board, fromRow, fromCol, toRow, toCol, color);
      case 'R':
        return this.isValidRookMove(board, fromRow, fromCol, toRow, toCol, color);
      case 'N':
        return this.isValidKnightMove(board, fromRow, fromCol, toRow, toCol, color);
      case 'B':
        return this.isValidBishopMove(board, fromRow, fromCol, toRow, toCol, color);
      case 'Q':
        return this.isValidQueenMove(board, fromRow, fromCol, toRow, toCol, color);
      case 'K':
        return this.isValidKingMove(board, fromRow, fromCol, toRow, toCol, color);
      default:
        return false;
    }
  }

  // Basic move validation methods
  isValidPawnMove(board, fromRow, fromCol, toRow, toCol, color) {
    const direction = color === 'w' ? -1 : 1;
    const startRow = color === 'w' ? 6 : 1;
    
    // Forward move
    if (fromCol === toCol && toRow === fromRow + direction) {
      return board[toRow][toCol] === '';
    }
    
    // Double move from start
    if (fromCol === toCol && fromRow === startRow && toRow === fromRow + 2 * direction) {
      return board[fromRow + direction][fromCol] === '' && board[toRow][toCol] === '';
    }
    
    // Capture
    if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction) {
      return board[toRow][toCol] !== '' && board[toRow][toCol][1] !== color;
    }
    
    return false;
  }

  isValidRookMove(board, fromRow, fromCol, toRow, toCol, color) {
    if (fromRow !== toRow && fromCol !== toCol) return false;
    
    const rowDir = fromRow === toRow ? 0 : (toRow > fromRow ? 1 : -1);
    const colDir = fromCol === toCol ? 0 : (toCol > fromCol ? 1 : -1);
    
    let currentRow = fromRow + rowDir;
    let currentCol = fromCol + colDir;
    
    while (currentRow !== toRow || currentCol !== toCol) {
      if (board[currentRow][currentCol] !== '') return false;
      currentRow += rowDir;
      currentCol += colDir;
    }
    
    return board[toRow][toCol] === '' || board[toRow][toCol][1] !== color;
  }

  isValidKnightMove(board, fromRow, fromCol, toRow, toCol, color) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    if (!((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) {
      return false;
    }
    
    return board[toRow][toCol] === '' || board[toRow][toCol][1] !== color;
  }

  isValidBishopMove(board, fromRow, fromCol, toRow, toCol, color) {
    if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;
    
    const rowDir = toRow > fromRow ? 1 : -1;
    const colDir = toCol > fromCol ? 1 : -1;
    
    let currentRow = fromRow + rowDir;
    let currentCol = fromCol + colDir;
    
    while (currentRow !== toRow && currentCol !== toCol) {
      if (board[currentRow][currentCol] !== '') return false;
      currentRow += rowDir;
      currentCol += colDir;
    }
    
    return board[toRow][toCol] === '' || board[toRow][toCol][1] !== color;
  }

  isValidQueenMove(board, fromRow, fromCol, toRow, toCol, color) {
    return this.isValidRookMove(board, fromRow, fromCol, toRow, toCol, color) ||
           this.isValidBishopMove(board, fromRow, fromCol, toRow, toCol, color);
  }

  isValidKingMove(board, fromRow, fromCol, toRow, toCol, color) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    
    return rowDiff <= 1 && colDiff <= 1 && 
           (board[toRow][toCol] === '' || board[toRow][toCol][1] !== color);
  }

  // Find castling move
  findCastlingMove(board, aiColor, side) {
    const kingRow = aiColor === 'w' ? 7 : 0;
    const kingCol = 4;
    const rookCol = side === 'kingside' ? 7 : 0;
    
    if (board[kingRow][kingCol] !== `K${aiColor}` || board[kingRow][rookCol] !== `R${aiColor}`) {
      return null;
    }
    
    return {
      fromRow: kingRow,
      fromCol: kingCol,
      toRow: kingRow,
      toCol: side === 'kingside' ? 6 : 2,
      isCastling: true,
      side: side
    };
  }

  // Fallback random move generator
  getRandomMove(board, aiColor) {
    const allMoves = [];
    
    // Get all valid moves for AI pieces using chess service
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece[1] === aiColor) {
          const moves = this.chessService.getPossibleMoves(board, row, col);
          moves.forEach(move => {
            allMoves.push({
              fromRow: row,
              fromCol: col,
              toRow: move.x,
              toCol: move.y,
              ...move
            });
          });
        }
      }
    }
    
    if (allMoves.length === 0) return null;
    
    return allMoves[Math.floor(Math.random() * allMoves.length)];
  }
}

export default AIService; 
import { GAME_STATES, INITIALBOARD } from '../components/board/boardconstant';

export class ChessService {
  constructor() {
    this.moveHistory = [];
    this.enPassantTarget = null;
    this.castlingRights = {
      white: { kingside: true, queenside: true },
      black: { kingside: true, queenside: true }
    };
  }

  // Check if a move puts the king in check
  isMoveValid(board, fromRow, fromCol, toRow, toCol, color, moveData = {}) {
    // For special moves, we need to handle them properly
    let newBoard;
    if (moveData.isCastling) {
      newBoard = this.makeCastlingMove(board, fromRow, fromCol, toRow, toCol, moveData);
    } else if (moveData.isEnPassant) {
      newBoard = this.makeEnPassantMove(board, fromRow, fromCol, toRow, toCol, moveData);
    } else {
      newBoard = this.makeMove(board, fromRow, fromCol, toRow, toCol);
    }
    return !this.isKingInCheck(newBoard, color);
  }

  // Make a move on the board
  makeMove(board, fromRow, fromCol, toRow, toCol) {
    const newBoard = board.map(row => row.slice());
    const piece = newBoard[fromRow][fromCol];
    newBoard[fromRow][fromCol] = '';
    newBoard[toRow][toCol] = piece;
    return newBoard;
  }

  // Make a castling move for validation
  makeCastlingMove(board, fromRow, fromCol, toRow, toCol, moveData) {
    const newBoard = board.map(row => row.slice());
    const piece = newBoard[fromRow][fromCol];
    
    // Move king
    newBoard[fromRow][fromCol] = '';
    newBoard[toRow][toCol] = piece;
    
    // Move rook
    const rookFromCol = moveData.side === 'kingside' ? 7 : 0;
    const rookToCol = moveData.side === 'kingside' ? 5 : 3;
    const rookPiece = newBoard[fromRow][rookFromCol];
    
    newBoard[fromRow][rookFromCol] = '';
    newBoard[fromRow][rookToCol] = rookPiece;
    
    return newBoard;
  }

  // Make an en passant move for validation
  makeEnPassantMove(board, fromRow, fromCol, toRow, toCol, moveData) {
    const newBoard = board.map(row => row.slice());
    const piece = newBoard[fromRow][fromCol];
    
    // Move pawn
    newBoard[fromRow][fromCol] = '';
    newBoard[toRow][toCol] = piece;
    
    // Remove captured pawn
    const capturedPawnRow = fromRow;
    const capturedPawnCol = toCol;
    newBoard[capturedPawnRow][capturedPawnCol] = '';
    
    return newBoard;
  }

  // Check if king is in check
  isKingInCheck(board, kingColor) {
    const kingPosition = this.findKing(board, kingColor);
    if (!kingPosition) return false;

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece && piece[1] !== kingColor) {
          const moves = this.getRawMoves(board, i, j);
          if (moves.some(move => move.x === kingPosition.x && move.y === kingPosition.y)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Find king position
  findKing(board, color) {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece && piece[0].toUpperCase() === 'K' && piece[1] === color) {
          return { x: i, y: j };
        }
      }
    }
    return null;
  }

  // Get all possible moves for a piece
  getPossibleMoves(board, row, col) {
    const piece = board[row][col];
    if (!piece) return [];

    const type = piece[0].toUpperCase();
    const color = piece[1];
    let moves = [];

    switch (type) {
      case 'K':
        moves = this.getKingMoves(board, row, col, color);
        break;
      case 'Q':
        moves = this.getQueenMoves(board, row, col, color);
        break;
      case 'R':
        moves = this.getRookMoves(board, row, col, color);
        break;
      case 'B':
        moves = this.getBishopMoves(board, row, col, color);
        break;
      case 'N':
        moves = this.getKnightMoves(board, row, col, color);
        break;
      case 'P':
        moves = this.getPawnMoves(board, row, col, color);
        break;
      default:
        moves = [];
    }

    // Filter out moves that would put own king in check
    return moves.filter(move => 
      this.isMoveValid(board, row, col, move.x, move.y, color, move)
    );
  }

  // King moves including castling
  getKingMoves(board, x, y, color) {
    const moves = [];
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    // Regular king moves
    directions.forEach(([dx, dy]) => {
      const newX = x + dx;
      const newY = y + dy;
      if (this.isWithinBoard(newX, newY) && !this.isOwnPiece(board, newX, newY, color)) {
        moves.push({ x: newX, y: newY });
      }
    });

    // Castling
    if (this.canCastle(board, x, y, color, 'kingside')) {
      moves.push({ x: x, y: y + 2, isCastling: true, side: 'kingside' });
    }
    if (this.canCastle(board, x, y, color, 'queenside')) {
      moves.push({ x: x, y: y - 2, isCastling: true, side: 'queenside' });
    }

    return moves;
  }

  // Check if castling is possible
  canCastle(board, kingX, kingY, color, side) {
    if (!this.castlingRights[color === 'w' ? 'white' : 'black'][side]) {
      return false;
    }

    if (this.isKingInCheck(board, color)) {
      return false;
    }

    const rookY = side === 'kingside' ? 7 : 0;
    const rookPiece = board[kingX][rookY];
    if (!rookPiece || rookPiece[0].toUpperCase() !== 'R' || rookPiece[1] !== color) {
      return false;
    }

    const direction = side === 'kingside' ? 1 : -1;
    const endY = side === 'kingside' ? 6 : 2;

    // Check if squares between king and rook are empty
    for (let y = kingY + direction; y !== endY + direction; y += direction) {
      if (board[kingX][y] !== '') {
        return false;
      }
    }

    // Check if king would pass through check
    for (let y = kingY; y !== endY + direction; y += direction) {
      if (this.isSquareUnderAttack(board, kingX, y, color)) {
        return false;
      }
    }

    return true;
  }

  // Check if square is under attack
  isSquareUnderAttack(board, x, y, attackingColor) {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece && piece[1] === attackingColor) {
          const moves = this.getRawMoves(board, i, j);
          if (moves.some(move => move.x === x && move.y === y)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  // Get raw moves without validation (for attack checking)
  getRawMoves(board, row, col) {
    const piece = board[row][col];
    if (!piece) return [];

    const type = piece[0].toUpperCase();
    const color = piece[1];

    switch (type) {
      case 'K':
        return this.getKingRawMoves(board, row, col, color);
      case 'Q':
        return this.getQueenMoves(board, row, col, color);
      case 'R':
        return this.getRookMoves(board, row, col, color);
      case 'B':
        return this.getBishopMoves(board, row, col, color);
      case 'N':
        return this.getKnightMoves(board, row, col, color);
      case 'P':
        return this.getPawnRawMoves(board, row, col, color);
      default:
        return [];
    }
  }

  // Raw king moves (without castling for attack checking)
  getKingRawMoves(board, x, y, color) {
    const moves = [];
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    directions.forEach(([dx, dy]) => {
      const newX = x + dx;
      const newY = y + dy;
      if (this.isWithinBoard(newX, newY) && !this.isOwnPiece(board, newX, newY, color)) {
        moves.push({ x: newX, y: newY });
      }
    });

    return moves;
  }

  // Raw pawn moves (without en passant for attack checking)
  getPawnRawMoves(board, x, y, color) {
    const moves = [];
    const direction = color === 'w' ? -1 : 1;

    // Forward move
    if (this.isWithinBoard(x + direction, y) && board[x + direction][y] === '') {
      moves.push({ x: x + direction, y });
    }

    // Captures
    const captureSquares = [
      { x: x + direction, y: y - 1 },
      { x: x + direction, y: y + 1 }
    ];

    captureSquares.forEach(({ x, y }) => {
      if (this.isWithinBoard(x, y) && this.isOpponentPiece(board, x, y, color)) {
        moves.push({ x, y });
      }
    });

    return moves;
  }

  // Queen moves
  getQueenMoves(board, x, y, color) {
    return [...this.getRookMoves(board, x, y, color), ...this.getBishopMoves(board, x, y, color)];
  }

  // Rook moves
  getRookMoves(board, x, y, color) {
    const moves = [];
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    directions.forEach(([dx, dy]) => {
      let newX = x + dx;
      let newY = y + dy;
      while (this.isWithinBoard(newX, newY) && !this.isOwnPiece(board, newX, newY, color)) {
        moves.push({ x: newX, y: newY });
        if (board[newX][newY] !== '') break;
        newX += dx;
        newY += dy;
      }
    });

    return moves;
  }

  // Bishop moves
  getBishopMoves(board, x, y, color) {
    const moves = [];
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

    directions.forEach(([dx, dy]) => {
      let newX = x + dx;
      let newY = y + dy;
      while (this.isWithinBoard(newX, newY) && !this.isOwnPiece(board, newX, newY, color)) {
        moves.push({ x: newX, y: newY });
        if (board[newX][newY] !== '') break;
        newX += dx;
        newY += dy;
      }
    });

    return moves;
  }

  // Knight moves
  getKnightMoves(board, x, y, color) {
    const moves = [];
    const knightMoves = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    knightMoves.forEach(([dx, dy]) => {
      const newX = x + dx;
      const newY = y + dy;
      if (this.isWithinBoard(newX, newY) && !this.isOwnPiece(board, newX, newY, color)) {
        moves.push({ x: newX, y: newY });
      }
    });

    return moves;
  }

  // Pawn moves including en passant
  getPawnMoves(board, x, y, color) {
    const moves = [];
    const direction = color === 'w' ? -1 : 1;
    const startRow = color === 'w' ? 6 : 1;

    // Forward move
    if (this.isWithinBoard(x + direction, y) && board[x + direction][y] === '') {
      moves.push({ x: x + direction, y });
      // Double move from starting position
      if (x === startRow && board[x + 2 * direction][y] === '') {
        moves.push({ x: x + 2 * direction, y, isDoubleMove: true });
      }
    }

    // Captures
    const captureSquares = [
      { x: x + direction, y: y - 1 },
      { x: x + direction, y: y + 1 }
    ];

    captureSquares.forEach(({ x, y }) => {
      if (this.isWithinBoard(x, y) && this.isOpponentPiece(board, x, y, color)) {
        moves.push({ x, y });
      }
    });

    // En passant
    if (this.enPassantTarget) {
      const epX = this.enPassantTarget.x;
      const epY = this.enPassantTarget.y;
      // Check if this pawn can capture en passant
      if (x + direction === epX && (y - 1 === epY || y + 1 === epY)) {
        moves.push({ x: epX, y: epY, isEnPassant: true });
      }
    }

    return moves;
  }

  // Check if position is within board
  isWithinBoard(x, y) {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
  }

  // Check if piece is own piece
  isOwnPiece(board, x, y, color) {
    const piece = board[x][y];
    return piece && piece[1] === color;
  }

  // Check if piece is opponent piece
  isOpponentPiece(board, x, y, color) {
    const piece = board[x][y];
    return piece && piece[1] !== color;
  }

  // Check for checkmate
  isCheckmate(board, color) {
    if (!this.isKingInCheck(board, color)) {
      return false;
    }

    // Check if any piece can block the check
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece && piece[1] === color) {
          const moves = this.getPossibleMoves(board, i, j);
          if (moves.length > 0) {
            return false;
          }
        }
      }
    }

    return true;
  }

  // Check for stalemate
  isStalemate(board, color) {
    if (this.isKingInCheck(board, color)) {
      return false;
    }

    // Check if any piece can move
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece && piece[1] === color) {
          const moves = this.getPossibleMoves(board, i, j);
          if (moves.length > 0) {
            return false;
          }
        }
      }
    }

    return true;
  }

  // Get game state
  getGameState(board, currentPlayer) {
    if (this.isCheckmate(board, currentPlayer)) {
      return GAME_STATES.CHECKMATE;
    }
    if (this.isStalemate(board, currentPlayer)) {
      return GAME_STATES.STALEMATE;
    }
    if (this.isKingInCheck(board, currentPlayer)) {
      return GAME_STATES.CHECK;
    }
    return GAME_STATES.PLAYING;
  }

  // Update castling rights after a move
  updateCastlingRights(fromRow, fromCol, toRow, toCol, piece) {
    const color = piece[1] === 'w' ? 'white' : 'black';
    
    // King moved
    if (piece[0].toUpperCase() === 'K') {
      this.castlingRights[color].kingside = false;
      this.castlingRights[color].queenside = false;
    }
    
    // Rook moved
    if (piece[0].toUpperCase() === 'R') {
      if (fromCol === 0) {
        this.castlingRights[color].queenside = false;
      } else if (fromCol === 7) {
        this.castlingRights[color].kingside = false;
      }
    }
  }

  // Execute a move and update game state
  executeMove(board, fromRow, fromCol, toRow, toCol, moveData = {}) {
    const newBoard = board.map(row => row.slice());
    const piece = newBoard[fromRow][fromCol];
    const capturedPiece = newBoard[toRow][toCol];
    
    // Handle castling
    if (moveData.isCastling) {
      const rookFromCol = moveData.side === 'kingside' ? 7 : 0;
      const rookToCol = moveData.side === 'kingside' ? 5 : 3;
      const rookPiece = newBoard[fromRow][rookFromCol];
      
      newBoard[fromRow][rookFromCol] = '';
      newBoard[fromRow][rookToCol] = rookPiece;
    }
    
    // Handle en passant
    if (moveData.isEnPassant) {
      const capturedPawnRow = fromRow;
      const capturedPawnCol = toCol;
      newBoard[capturedPawnRow][capturedPawnCol] = '';
    }
    
    // Regular move
    newBoard[fromRow][fromCol] = '';
    newBoard[toRow][toCol] = piece;
    
    // Update en passant target
    if (moveData.isDoubleMove) {
      this.enPassantTarget = { x: toRow, y: toCol };
    } else {
      this.enPassantTarget = null;
    }
    
    // Update castling rights
    this.updateCastlingRights(fromRow, fromCol, toRow, toCol, piece);
    
    // Add to move history
    this.moveHistory.push({
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      piece,
      captured: capturedPiece,
      isCastling: moveData.isCastling,
      isEnPassant: moveData.isEnPassant,
      isDoubleMove: moveData.isDoubleMove,
      side: moveData.side // Add castling side information
    });
    
    return newBoard;
  }

  // Reconstruct board from move history
  reconstructBoardFromHistory(moveHistory) {
    const board = INITIALBOARD.map(row => row.slice());
    
    moveHistory.forEach(move => {
      const { from, to, piece, captured, isCastling, isEnPassant, side } = move;
      
      // Handle castling
      if (isCastling) {
        const rookFromCol = side === 'kingside' ? 7 : 0;
        const rookToCol = side === 'kingside' ? 5 : 3;
        const rookPiece = board[from.row][rookFromCol];
        
        board[from.row][rookFromCol] = '';
        board[from.row][rookToCol] = rookPiece;
      }
      
      // Handle en passant
      if (isEnPassant) {
        const capturedPawnRow = from.row;
        const capturedPawnCol = to.col;
        board[capturedPawnRow][capturedPawnCol] = '';
      }
      
      // Regular move
      board[from.row][from.col] = '';
      board[to.row][to.col] = piece;
    });
    
    return board;
  }
}

export default ChessService; 
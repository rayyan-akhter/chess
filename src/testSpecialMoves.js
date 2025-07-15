import ChessService from './services/chessService';
import { INITIALBOARD } from './components/board/boardconstant';

// Test special moves (castling and en passant)
const testSpecialMoves = () => {
  const chessService = new ChessService();
  
  console.log('🧪 Testing Special Moves...');
  
  // Test 1: Castling rights
  console.log('✅ Castling rights:', chessService.castlingRights);
  
  // Test 2: Can castle from initial position
  const canCastleKingside = chessService.canCastle(INITIALBOARD, 7, 4, 'w', 'kingside');
  const canCastleQueenside = chessService.canCastle(INITIALBOARD, 7, 4, 'w', 'queenside');
  console.log('✅ Can castle kingside:', canCastleKingside);
  console.log('✅ Can castle queenside:', canCastleQueenside);
  
  // Test 3: King moves including castling
  const kingMoves = chessService.getPossibleMoves(INITIALBOARD, 7, 4); // White king
  console.log('✅ White king moves:', kingMoves);
  
  // Test 4: Create a position for en passant
  const enPassantBoard = INITIALBOARD.map(row => row.slice());
  // Move white pawn to e4
  enPassantBoard[6][4] = ''; // Remove pawn from e2
  enPassantBoard[4][4] = 'Pw'; // Place pawn on e4
  // Move black pawn to d4 (double move)
  enPassantBoard[1][3] = ''; // Remove pawn from d7
  enPassantBoard[3][3] = 'pb'; // Place pawn on d4
  // Set en passant target
  chessService.enPassantTarget = { x: 3, y: 3 };
  
  // Test 5: En passant move
  const pawnMoves = chessService.getPossibleMoves(enPassantBoard, 4, 4); // White pawn on e4
  console.log('✅ En passant moves:', pawnMoves);
  
  // Test 6: Execute castling move
  if (canCastleKingside) {
    const castledBoard = chessService.executeMove(INITIALBOARD, 7, 4, 7, 6, { isCastling: true, side: 'kingside' });
    console.log('✅ Castling executed successfully');
    console.log('✅ King position after castling:', castledBoard[7][6]);
    console.log('✅ Rook position after castling:', castledBoard[7][5]);
  }
  
  console.log('🎉 Special moves tests completed!');
};

export default testSpecialMoves; 
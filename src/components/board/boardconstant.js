export const PIECESIMAGES = {
    whiteQueen: `${process.env.PUBLIC_URL}/assets/qw.png`,
    blackQueen: `${process.env.PUBLIC_URL}/assets/qb.png`,
    whiteRook: `${process.env.PUBLIC_URL}/assets/rw.png`,
    blackRook: `${process.env.PUBLIC_URL}/assets/rb.png`,
    whiteBishop: `${process.env.PUBLIC_URL}/assets/bw.png`,
    blackBishop: `${process.env.PUBLIC_URL}/assets/bb.png`,
    whiteKnight: `${process.env.PUBLIC_URL}/assets/nw.png`,
    blackKnight: `${process.env.PUBLIC_URL}/assets/nb.png`,
    whitePawn: `${process.env.PUBLIC_URL}/assets/pw.png`,
    blackPawn: `${process.env.PUBLIC_URL}/assets/pb.png`,
    whiteKing: `${process.env.PUBLIC_URL}/assets/kw.png`,
    blackKing: `${process.env.PUBLIC_URL}/assets/kb.png`,
  };
  
export const INITIALBOARD = [
    ["rb", "nb", "bb", "qb", "kb", "bb", "nb", "rb"],
    ["pb", "pb", "pb", "pb", "pb", "pb", "pb", "pb"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["Pw", "Pw", "Pw", "Pw", "Pw", "Pw", "Pw", "Pw"],
    ["Rw", "Nw", "Bw", "Qw", "Kw", "Bw", "Nw", "Rw"],
  ];

export const GAME_STATES = {
  PLAYING: 'playing',
  CHECK: 'check',
  CHECKMATE: 'checkmate',
  STALEMATE: 'stalemate',
  DRAW: 'draw',
  TIMEOUT: 'timeout'
};

export const COLORS = {
  WHITE: 'w',
  BLACK: 'b'
};

export const TIMER_MODES = {
  NONE: 'none',
  TEN_MIN: '10min',
  FIFTEEN_MIN: '15min',
  THIRTY_MIN: '30min'
};

export const TIMER_DURATIONS = {
  [TIMER_MODES.TEN_MIN]: 10 * 60, // 10 minutes in seconds
  [TIMER_MODES.FIFTEEN_MIN]: 15 * 60, // 15 minutes in seconds
  [TIMER_MODES.THIRTY_MIN]: 30 * 60 // 30 minutes in seconds
};  
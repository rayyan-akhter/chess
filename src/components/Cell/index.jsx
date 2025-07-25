import "./style.css";

const Cell = ({ rowIndex, colIndex, piece, isSelected, onClick, isInCheck, isPreviousMove }) => {
  const isKing = piece && piece[0].toUpperCase() === 'K';
  const isKingInCheck = isInCheck && isKing;
  
  return (
    <div
      className={`square ${(rowIndex + colIndex) % 2 !== 0 && "black"} ${
        isSelected ? "selected" : ""
      } ${isKingInCheck ? "check" : ""} ${
        isPreviousMove ? "previous-move" : ""
      }`}
      id={`${rowIndex}-${colIndex}`}
      onClick={onClick}
    >
      {piece && <Piece type={piece} />}
    </div>
  );
};

const Piece = ({ type }) => {
  return (
    <img src={`${process.env.PUBLIC_URL}/assets/${type}.png`} alt="piece" />
  );
};

export default Cell;

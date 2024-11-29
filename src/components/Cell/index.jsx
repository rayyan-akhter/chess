import "./style.css";

const Cell = ({ rowIndex, colIndex, piece, isSelected, onClick,isInCheck }) => {
  return (
    <div
      className={`square ${(rowIndex + colIndex) % 2 !== 0 && "black"} ${
        isSelected ? "selected" : ""
      } ${isInCheck ? "check" : ""} `}
      id={`${rowIndex}-${colIndex}`}
      onClick={onClick}
    >
      {piece && <Piece type={piece} />}
    </div>
  );
};

const Piece = ({ type }) => {
  return (
    <img src={`${process.env.PUBLIC_URL}/assets/${type}.png`} alt="cell" />
  );
};

export default Cell;

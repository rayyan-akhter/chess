import React, { useRef, useState } from "react";
import Cell from "../Cell";
import "./style.css";
import { PIECESIMAGES, INITIALBOARD } from "./boardconstant";

const Board = () => {
  const [board, setBoard] = useState(INITIALBOARD);
  const [selectedPiece, setSelectedPiece] = useState("null");
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [capturedPiecs, setCapturedpiecs] = useState({ white: [], black: [] });
  const lastPieceSelected = useRef("b");
  const [promotion, setPromotion] = useState({
    active: false,
    rowIndex: null,
    colIndex: null,
    color: null,
  });

  const selectPiece = (rowIndex, colIndex) => {
    const piece = board[rowIndex][colIndex];

    if (selectedPiece) {
      const isMoveAllowed = possibleMoves.some(
        (move) => move.x === rowIndex && move.y === colIndex
      );

      if (isMoveAllowed) {
        movePiece(rowIndex, colIndex);
        removeHighlightClass();
        lastPieceSelected.current = selectedPiece.piece.slice(-1);
        return;
      }

      const isSameColor =
        piece && selectedPiece.piece && piece[1] === selectedPiece.piece[1];
      if (isSameColor) {
        setSelectedPiece({ piece, rowIndex, colIndex });
        removeHighlightClass();
        const moves = showPossibleMoves({ piece, rowIndex, colIndex });
        setPossibleMoves(moves);
        return;
      }

      removeHighlightClass();
      setSelectedPiece(null);
      setPossibleMoves([]);
    } else if (piece) {
      if (piece[1] === lastPieceSelected.current) return;
      setSelectedPiece({ piece, rowIndex, colIndex });
      const moves = showPossibleMoves({ piece, rowIndex, colIndex });
      setPossibleMoves(moves);
    }
  };

  const movePiece = (rowIndex, colIndex) => {
    if (!selectedPiece) return;
    const {
      piece,
      rowIndex: oldRowIndex,
      colIndex: oldColIndex,
    } = selectedPiece;
    const color = piece[1];
    const newBoard = board.map((row) => row.slice());
    newBoard[oldRowIndex][oldColIndex] = "";
    newBoard[rowIndex][colIndex] = piece;

    const targetPiece = board[rowIndex][colIndex];
    if (targetPiece) {
      setCapturedpiecs((prev) => ({
        ...prev,
        [targetPiece[1] === "w" ? "white" : "black"]: [
          ...prev[targetPiece[1] === "w" ? "white" : "black"],
          targetPiece,
        ],
      }));
    }
    newBoard[oldRowIndex][oldColIndex] = "";
    newBoard[rowIndex][colIndex] = piece;
    if (
      (piece[0] === "P" || piece[0] === "p") &&
      ((color === "w" && rowIndex === 0) || (color === "b" && rowIndex === 7))
    ) {
      setPromotion({ active: true, rowIndex, colIndex, color });
      setBoard(newBoard);
      return;
    }
    setBoard(newBoard);
    setSelectedPiece(null);
    setPossibleMoves([]);
  };

  const showPossibleMoves = ({ piece, rowIndex, colIndex }) => {
    const type = piece[0].toUpperCase();
    const color = piece[1];
    let possibleMoves = [];
    switch (type) {
      case "K":
        possibleMoves = getKingMoves(rowIndex, colIndex, color);
        break;
      case "Q":
        possibleMoves = getQueenMoves(rowIndex, colIndex, color);
        break;
      case "R":
        possibleMoves = getRookMoves(rowIndex, colIndex, color);
        break;
      case "B":
        possibleMoves = getBishopMoves(rowIndex, colIndex, color);
        break;
      case "N":
        possibleMoves = getKnightMoves(rowIndex, colIndex, color);
        break;
      case "P":
        possibleMoves = getPawnMoves(rowIndex, colIndex, color);
        break;

      default:
        possibleMoves = [];
    }

    possibleMoves.forEach((move) => {
      const { x, y } = move;
      const cell = document.getElementById(`${x}-${y}`);
      cell.classList.add("highlight");
    });
    return possibleMoves;
  };

  const isWithinTheBoard = (x, y) => {
    return x >= 0 && x < 8 && y >= 0 && y < 8;
  };

  const isBlockedByItsPiece = (x, y, color) => {
    const piece = board[x][y];
    return piece?.[1] === color;
  };

  const getKingMoves = (x, y, color) => {
    const kingsMove = [
      { x: x + 1, y },
      { x: x - 1, y },
      { x: x + 1, y: y + 1 },
      { x: x + 1, y: y - 1 },

      { x: x, y: y - 1 },
      { x: x, y: y + 1 },
      { x: x - 1, y: y - 1 },
      { x: x - 1, y: y + 1 },
    ];
    return kingsMove.filter((move) => {
      const { x, y } = move;
      return isWithinTheBoard(x, y) && !isBlockedByItsPiece(x, y, color);
    });
  };

  const getRookMoves = (x, y, color) => {
    const rookMove = [];
    const rookDirection = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    rookDirection.forEach(([rdx, rdy]) => {
      let newX = x + rdx,
        newY = y + rdy;
      while (
        isWithinTheBoard(newX, newY) &&
        !isBlockedByItsPiece(newX, newY, color)
      ) {
        rookMove.push({ x: newX, y: newY });
        if (board[newX][newY]) break;
        newX += rdx;
        newY += rdy;
      }
    });
    return rookMove;
  };

  const getBishopMoves = (x, y, color) => {
    const bishopMove = [];
    const bishopDirection = [
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
    ];
    bishopDirection.forEach(([rdx, rdy]) => {
      let newX = x + rdx,
        newY = y + rdy;
      while (
        isWithinTheBoard(newX, newY) &&
        !isBlockedByItsPiece(newX, newY, color)
      ) {
        bishopMove.push({ x: newX, y: newY });
        if (board[newX][newY]) break;
        newX += rdx;
        newY += rdy;
      }
    });
    return bishopMove;
  };

  const getQueenMoves = (x, y, color) => {
    return [...getRookMoves(x, y, color), ...getBishopMoves(x, y, color)];
  };

  const getKnightMoves = (x, y, color) => {
    const knightMove = [
      { x: x + 2, y: y + 1 },
      { x: x + 2, y: y - 1 },
      { x: x - 2, y: y + 1 },
      { x: x - 2, y: y - 1 },

      { x: x + 1, y: y + 2 },
      { x: x - 1, y: y + 2 },
      { x: x - 1, y: y - 2 },
      { x: x + 1, y: y - 2 },
    ];

    return knightMove.filter((move) => {
      const { x, y } = move;
      return isWithinTheBoard(x, y) && !isBlockedByItsPiece(x, y, color);
    });
  };

  const getPawnMoves = (x, y, color) => {
    const pawnMoves = [];
    const direction = color === "w" ? -1 : 1;
    const startRow = color === "w" ? 6 : 1;

    if (isWithinTheBoard(x + direction, y) && !board[x + direction][y]) {
      pawnMoves.push({ x: x + direction, y });
      if (x === startRow && !board[x + 2 * direction][y]) {
        pawnMoves.push({ x: x + 2 * direction, y });
      }
    }

    const captureMoves = [
      { x: x + direction, y: y + 1 },
      { x: x + direction, y: y - 1 },
    ];
    captureMoves.forEach(({ x, y }) => {
      if (isWithinTheBoard(x, y) && board[x][y] && board[x][y][1] !== color) {
        pawnMoves.push({ x, y });
      }
    });
    return pawnMoves;
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
    setSelectedPiece(null);
  };

  const removeHighlightClass = () => {
    for (let x = 0; x < 8; x++) {
      for (let y = 0; y < 8; y++) {
        const element = document.getElementById(`${x}-${y}`);
        element.classList.remove("highlight");
      }
    }
  };

  return (
    <div className="chess">
      <div className="capturedPiece ">
        {capturedPiecs.black.map((piece, index) => (
          <img
            key={index}
            src={`${process.env.PUBLIC_URL}/assets/${piece}.png`}
            alt={piece}
          />
        ))}
      </div>
      <div className="chessBoard">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((piece, colIndex) => (
              <Cell
                piece={piece}
                rowIndex={rowIndex}
                colIndex={colIndex}
                isSelected={
                  selectedPiece &&
                  selectedPiece.rowIndex === rowIndex &&
                  selectedPiece.colIndex === colIndex
                }
                onClick={() => selectPiece(rowIndex, colIndex)}
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
                    : PIECESIMAGES.blackQueenImg
                }
                alt="Queen"
                onClick={() => pawnPromotion("Q")}
              />
              <img
                src={
                  promotion.color === "w"
                    ? PIECESIMAGES.whiteRookImage
                    : PIECESIMAGES.blackRookImage
                }
                alt="Rook"
                onClick={() => pawnPromotion("R")}
              />
              <img
                src={
                  promotion.color === "w"
                    ? PIECESIMAGES.whiteBishopImage
                    : PIECESIMAGES.blackBishopImage
                }
                alt="Bishop"
                onClick={() => pawnPromotion("B")}
              />
              <img
                src={
                  promotion.color === "w"
                    ? PIECESIMAGES.whiteKnightImage
                    : PIECESIMAGES.blackKnightImage
                }
                alt="Knight"
                onClick={() => pawnPromotion("N")}
              />
            </div>
          </div>
        )}
      </div>
      <div className="capturedPiece ">
        {capturedPiecs.white.map((piece, index) => (
          <img
            key={index}
            src={`${process.env.PUBLIC_URL}/assets/${piece}.png`}
            alt={piece}
          />
        ))}
      </div>
    </div>
  );
};

export default Board;

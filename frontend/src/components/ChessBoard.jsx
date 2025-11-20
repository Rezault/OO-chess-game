import React, { useState } from "react";
import { initialBoard } from "../game/initialBoard";
import { pieceImages } from "../game/pieceImages";
import {
  applyMoveIfLegal,
  computeValidMoves,
  isKingInCheck,
  findKing,
  hasAnyLegalMove,
  getGameStatus,
} from "../game/engine";

function ChessBoard({ gameState, myName, onAttemptMove, gameStatus }) {
  const [selected, setSelected] = useState(null); // [row, col] or null
  const [moveSquares, setMoveSquares] = useState([]);

  const board = gameState?.board.grid || initialBoard;
  const turn = gameState?.turn === "WHITE" ? "w" : "b";

  // figure out if I am white or black
  const myColor =
    gameState && gameState.whitePlayer === myName
      ? "w"
      : gameState && gameState.blackPlayer === myName
      ? "b"
      : "w"; // default

  const isFlipped = myColor === "b";

  // check if king is in check
  const inCheck = isKingInCheck(board, turn);
  const kingPos = inCheck ? findKing(board, turn) : null;
  const kingRow = kingPos ? kingPos[0] : null;
  const kingCol = kingPos ? kingPos[1] : null;

  const getPromotionChoice = () => {
    // when pawn reaches end of board
    // prompt the user what piece they want to promote to
    let choice = window.prompt("Promote pawn to (q, r, b, n):", "q");
    if (!choice) return "q";
    choice = choice.trim().toLowerCase();
    return ["q", "r", "b", "n"].includes(choice) ? choice : "q";
  };

  const handleSquareClick = (row, col) => {
    // check if we have a game state and the status is in progress
    if (!gameState || gameState.status !== "IN_PROGRESS") return;

    const piece = board[row][col];

    // If nothing selected yet
    if (!selected) {
      if (!piece) return; // clicking empty square does nothing

      const pieceColor = piece[0];
      if (pieceColor !== turn) {
        // not this piece's turn
        return;
      }

      if (pieceColor !== myColor) {
        // cannot choose another player's piece
        return;
      }

      // compute the squares this piece can move to
      const validMoves = computeValidMoves(board, row, col, gameState);

      setSelected([row, col]);
      setMoveSquares(validMoves);
      return;
    }

    // If clicking the same square -> deselect
    if (selected[0] === row && selected[1] === col) {
      setSelected(null);
      setMoveSquares([]);
      return;
    }

    // local check
    const tmpBoard = applyMoveIfLegal(
      board,
      selected,
      [row, col],
      turn,
      gameState
    );
    if (!tmpBoard) {
      setSelected(null);
      setMoveSquares([]);
      return;
    }

    // get the piece we moved and check if there's a promotion
    const movingPiece = board[selected[0]][selected[1]];
    let promotion = null;
    if (movingPiece && movingPiece[1] === "p") {
      const promotionRow = movingPiece[0] === "w" ? 0 : 7;
      if (row === promotionRow) {
        promotion = getPromotionChoice();
      }
    }

    // looks legal, time to move to the server
    onAttemptMove(selected, [row, col], promotion);
    setSelected(null);
    setMoveSquares([]);
  };

  // helper to know if a square is selected
  const isSelected = (row, col) =>
    selected && selected[0] === row && selected[1] === col;

  const squares = [];
  for (let uiRow = 0; uiRow < 8; uiRow++) {
    for (let uiCol = 0; uiCol < 8; uiCol++) {
      // map UI coords -> actual board coords
      const row = isFlipped ? 7 - uiRow : uiRow;
      const col = isFlipped ? 7 - uiCol : uiCol;

      let piece = board[row][col];

      // if we have a powerup on this square, display it
      if (
        gameState &&
        gameState.mysteryBoxRow == row &&
        gameState.mysteryBoxCol == col
      ) {
        piece = "box";
      }

      const isLightSquare = (uiRow + uiCol) % 2 === 0;
      const isMoveSquare = moveSquares.some(([r, c]) => r === row && c === col);
      const isKingSquare = inCheck && row === kingRow && col === kingCol;

      let bgColor = isMoveSquare
        ? "#50C878"
        : isLightSquare
        ? "#d3d3d3"
        : "#0000ff";

      if (isKingSquare) {
        bgColor = "#ff4d4f"; // red square for king in check
      }

      const selectedStyle = isSelected(row, col)
        ? { boxShadow: "inset 0 0 0 3px yellow" }
        : {};

      const moveSquareShadow = isMoveSquare
        ? { boxShadow: "inset 0 0 0 3px black" }
        : {};

      const inCheckShadow = isKingSquare
        ? { boxShadow: "inset 0 0 0 3px red" }
        : {};

      squares.push(
        <div
          key={`${uiRow}-${uiCol}`}
          onClick={() => handleSquareClick(row, col)}
          style={{
            width: "60px",
            height: "60px",
            backgroundColor: bgColor,
            position: "relative",
            cursor: "pointer",
            ...selectedStyle,
            ...moveSquareShadow,
            ...inCheckShadow,
          }}
        >
          {piece && (
            <img
              src={pieceImages[piece]}
              alt={piece}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                userSelect: "none",
                pointerEvents: "none",
              }}
            />
          )}
        </div>
      );
    }
  }

  return (
    <div
      style={{
        display: "inline-block",
        border: "4px solid #333",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      {gameStatus === "CHECKMATE" && (
        <div style={{ textAlign: "center", color: "red", fontWeight: "bold" }}>
          Checkmate! {turn == "w" ? "Black" : "White"} wins!
        </div>
      )}
      {gameStatus === "STALEMATE" && (
        <div
          style={{ textAlign: "center", color: "orange", fontWeight: "bold" }}
        >
          Stalemate. It's a draw!
        </div>
      )}
      {/* top name should always be the opponent */}
      <div
        style={{
          marginTop: "0.5rem",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        {gameState
          ? myColor === "w"
            ? gameState.blackPlayer
            : gameState.whitePlayer
          : "PlayerName"}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 60px)",
          gridTemplateRows: "repeat(8, 60px)",
        }}
      >
        {squares}
      </div>

      {/* bottom name is always me */}
      <div
        style={{
          marginTop: "0.5rem",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        {gameState
          ? myColor === "w"
            ? gameState.whitePlayer
            : gameState.blackPlayer
          : "PlayerName"}
      </div>

      <div
        style={{
          marginTop: "0.5rem",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        Turn: {(gameState && gameState.turn) || ""}
      </div>
    </div>
  );
}

export default ChessBoard;

import React, { useState } from "react";
import { initialBoard } from "../game/initialBoard";
import { pieceImages } from "../game/pieceImages";
import { applyMoveIfLegal } from "../game/engine";

function ChessBoard({ gameState, myName }) {
  const [board, setBoard] = useState(initialBoard);
  const [selected, setSelected] = useState(null); // [row, col] or null
  const [turn, setTurn] = useState("w"); // "w" or "b"

  // figure out if I am white or black
  const myColor =
    gameState && gameState.whitePlayer === myName
      ? "w"
      : gameState && gameState.blackPlayer === myName
      ? "b"
      : "w"; // default

  const isFlipped = myColor === "b";

  const handleSquareClick = (row, col) => {
    // check if we have a game state and the status is in progress
    if (!gameState || gameState.status != "IN_PROGRESS") return;

    const piece = board[row][col];

    // If nothing selected yet
    if (!selected) {
      if (!piece) return; // clicking empty square does nothing

      const pieceColor = piece[0];
      if (pieceColor !== turn) {
        // not this piece's turn
        return;
      }

      setSelected([row, col]);
      return;
    }

    // If clicking the same square -> deselect
    if (selected[0] === row && selected[1] === col) {
      setSelected(null);
      return;
    }

    // Try to move from selected -> (row, col)
    const newBoard = applyMoveIfLegal(board, selected, [row, col], turn);
    if (newBoard) {
      setBoard(newBoard);
      setSelected(null);
      setTurn(turn === "w" ? "b" : "w");
      // later: send move to backend here
    } else {
      // illegal move -> either keep selection or clear it
      setSelected(null);
    }
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

      const piece = board[row][col];
      const isLightSquare = (uiRow + uiCol) % 2 === 0;
      const bgColor = isLightSquare ? "#d3d3d3" : "#0000FF";

      const selectedStyle = isSelected(row, col)
        ? { boxShadow: "inset 0 0 0 3px yellow" }
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
      {/* Top name should always be the opponent */}
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

      {/* Bottom name is always me */}
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

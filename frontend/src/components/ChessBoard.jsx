import React, { useState } from "react";
import { initialBoard } from "../game/initialBoard";
import { pieceImages } from "../game/pieceImages";
import { applyMoveIfLegal } from "../game/engine";

function ChessBoard({ myColor = "w" }) {
  const [board, setBoard] = useState(initialBoard);
  const [selected, setSelected] = useState(null); // [row, col] or null
  const [turn, setTurn] = useState("w"); // "w" or "b"

  const handleSquareClick = (row, col) => {
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

  return (
    <div
      style={{
        display: "inline-block",
        border: "4px solid #333",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 60px)",
          gridTemplateRows: "repeat(8, 60px)",
        }}
      >
        {board.map((rank, row) =>
          rank.map((piece, col) => {
            const isLightSquare = (row + col) % 2 === 0;
            const bgColor = isLightSquare ? "#d3d3d3" : "#0000FF";

            const selectedStyle = isSelected(row, col)
              ? { boxShadow: "inset 0 0 0 3px yellow" }
              : {};

            return (
              <div
                key={`${row}-${col}`}
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
          })
        )}
      </div>

      <div
        style={{
          marginTop: "0.5rem",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        Turn: {turn === "w" ? "White" : "Black"}
      </div>
    </div>
  );
}

export default ChessBoard;

import { motion } from "motion/react";
import { pieceImages } from "../game/pieceImages";

const TILE_SIZE = 60;

function GhostPiece({ ghost, isFlipped }) {
  const { piece, effect } = ghost;
  if (!piece || !effect) return;

  const baseCode = piece === "box" ? "box" : piece.slice(0, 2);
  if (effect === "DISINTEGRATION" || effect === "BETRAYAL") {
    const { fromRow, fromCol, toRow, toCol } = ghost;
    const fromUiRow = isFlipped ? 7 - fromRow : fromRow;
    const fromUiCol = isFlipped ? 7 - fromCol : fromCol;
    const toUiRow = isFlipped ? 7 - toRow : toRow;
    const toUiCol = isFlipped ? 7 - toCol : toCol;

    const fromX = fromUiCol * TILE_SIZE;
    const fromY = fromUiRow * TILE_SIZE;
    const toX = toUiCol * TILE_SIZE;
    const toY = toUiRow * TILE_SIZE;

    return (
      <motion.img
        key={`ghost-dis-${piece}-${fromRow}-${fromCol}-${toRow}-${toCol}`}
        src={pieceImages[baseCode]}
        alt={piece}
        className="chess-piece"
        initial={{ x: fromX, y: fromY, opacity: 1, scale: 1 }}
        animate={{
          x: [fromX, toX],
          y: [fromY, toY],
          opacity: [1, 1, 0],
          scale: [1, 1, 0.2],
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          userSelect: "none",
          pointerEvents: "none",
          filter: "drop-shadow(0 0 8px rgba(255,255,255,0.8))",
        }}
      />
    );
  }

  const { row, col } = ghost;

  const uiRow = isFlipped ? 7 - row : row;
  const uiCol = isFlipped ? 7 - col : col;

  const x = uiCol * TILE_SIZE;
  const y = uiRow * TILE_SIZE;

  return (
    <motion.img
      key={`ghost-${piece}-${row}-${col}`}
      src={pieceImages[baseCode]}
      alt={piece}
      className="chess-piece"
      initial={{ x, y, opacity: 1, scale: 1 }}
      animate={{ x, y, opacity: 0, scale: 0.3 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.8 }}
      style={{
        userSelect: "none",
        pointerEvents: "none",
        filter: "drop-shadow(0 0 8px rgba(255,255,255,0.8))",
      }}
    />
  );
}

export default GhostPiece;

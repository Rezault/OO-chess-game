// ChessBoard.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const TILE_SIZE = 80; // pixels

function Piece({ row, col, piece, id }) {
  return (
    <motion.div
      className="chess-piece"
      initial={false} // don't animate on first paint
      animate={{
        x: col * TILE_SIZE,
        y: row * TILE_SIZE,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.5,
      }}
      layoutId={id}
    >
      <span>{piece}</span>
    </motion.div>
  );
}

export default Piece;

import { motion, AnimatePresence } from "motion/react";
import React from "react";

function GameOverAnnouncement({ result, winner, onHome }) {
  // result = "CHECKMATE" or "STALEMATE"
  // winner = "White" | "Black" | null (for stalemate)

  const title = result === "CHECKMATE" ? "Checkmate!" : "Stalemate!";

  const subtitle =
    result === "CHECKMATE" ? `${winner} wins the game` : "It's a draw";

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          className="gameover-overlay-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="gameover-overlay-card"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
          >
            <div className="gameover-title">{title}</div>
            <div className="gameover-subtitle">{subtitle}</div>

            <button className="gameover-button" onClick={onHome}>
              Return Home
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default GameOverAnnouncement;

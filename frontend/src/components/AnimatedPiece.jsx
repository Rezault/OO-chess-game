import { motion } from "motion/react";
import { pieceImages } from "../game/pieceImages";

function AnimatedPiece({ pieceCode, displayPiece, animate, transition }) {
  return (
    <motion.img
      key={displayPiece}
      layoutId={displayPiece}
      src={pieceImages[pieceCode]}
      alt={displayPiece}
      className="chess-piece"
      initial={false}
      animate={animate}
      transition={transition}
      style={{
        userSelect: "none",
        pointerEvents: "none",
        transformOrigin: "50% 100%",
      }}
    />
  );
}

export default AnimatedPiece;

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

// powerup type -> display name + logo
const POWERUP_META = {
  "Freeze Piece": {
    label: "Freeze Piece",
    color: "#38bdf8",
  },
  "Extra Move": {
    label: "Extra Move",
    color: "#22c55e",
  },
  "Evolve Piece": {
    label: "Evolve Piece",
    color: "#eab308",
  },
};

const POWERDOWN_META = {
  Disintegration: {
    label: "Disintegration",
    color: "#9D00FF",
  },
  Betrayal: {
    label: "Betrayal",
    color: "#FF0000",
  },
};

function PowerUpAnnouncement({ powerUp, onClose }) {
  // auto-close after 2.5s
  useEffect(() => {
    if (!powerUp) return;
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [powerUp, onClose]);

  let powerType = "Power-up";
  if (powerUp && powerUp.type in POWERDOWN_META) {
    powerType = "Power-down";
  }

  const meta = (powerUp && POWERUP_META[powerUp.type]) ||
    (powerUp && POWERDOWN_META[powerUp.type]) || {
      label: powerUp?.type ?? "",
      color: "#f97316",
    };

  return (
    <AnimatePresence>
      {powerUp && (
        <motion.div
          key={powerUp.type}
          className="powerup-overlay-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="powerup-overlay-card"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }} // fade/scale out
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
          >
            {/* logo/icon area */}
            <div
              className="powerup-overlay-icon"
              style={{
                background: `radial-gradient(circle, ${meta.color}, #0f172a)`,
              }}
            >
              {/* when logo images done, use <img src={...} /> here */}
              <span className="powerup-overlay-icon-text">⚡</span>
            </div>

            <div className="powerup-overlay-text">
              {powerType === "Power-up" && (
                <div className="powerup-overlay-announce">
                  Power-up activated!
                </div>
              )}
              {powerType === "Power-down" && (
                <div className="powerup-overlay-announce">Unlucky!</div>
              )}
              <div className="powerup-overlay-title">{meta.label}</div>
              <div className="powerup-overlay-subtitle">
                {powerUp.type === "Freeze Piece" &&
                  "Lock an enemy piece in place!"}
                {powerUp.type === "Extra Move" &&
                  "Take another turn immediately."}
                {powerUp.type === "Evolve Piece" &&
                  "Empower one of your pieces."}
                {powerUp.type === "Disintegration" &&
                  "Your piece is engulfed by the void."}
                {powerUp.type === "Betrayal" && "A traitor? He must be caught!"}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PowerUpAnnouncement;

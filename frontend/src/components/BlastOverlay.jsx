import { motion } from "motion/react";

function BlastOverlay({ delay = 1 }) {
  return (
    <>
      {/* Bright flash */}
      <motion.div
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: [0.8, 0.6, 0], scale: [0.3, 2, 3] }}
        transition={{ duration: 0.45, ease: "easeOut", delay }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,0,0.2))",
          pointerEvents: "none",
          mixBlendMode: "screen",
        }}
      />

      {/* Shockwave ring */}
      <motion.div
        initial={{ opacity: 1, scale: 0.1 }}
        animate={{ opacity: 0, scale: 3 }}
        transition={{ duration: 0.6, ease: "easeOut", delay }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "6px solid rgba(255, 200, 0, 1)",
          filter: "blur(2px)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

export default BlastOverlay;

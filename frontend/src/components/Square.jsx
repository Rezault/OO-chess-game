import BlastOverlay from "./BlastOverlay";

function Square({
  uiRow,
  uiCol,
  bgColor,
  onClick,
  isSelected,
  isMoveSquare,
  isKingSquare,
  isBlastSquare,
  children,
}) {
  const selectedStyle = isSelected
    ? { boxShadow: "inset 0 0 0 3px yellow" }
    : {};
  const moveSquareShadow = isMoveSquare
    ? { boxShadow: "inset 0 0 0 3px black" }
    : {};
  const inCheckShadow = isKingSquare
    ? { boxShadow: "inset 0 0 0 3px red" }
    : {};
  const blastSquareShadow = isBlastSquare
    ? { boxShadow: "inset 0 0 0 3px red" }
    : {};

  return (
    <div
      key={`sq-${uiRow}-${uiCol}`}
      onClick={onClick}
      className="chess-square"
      style={{
        backgroundColor: bgColor,
        position: "relative",
        cursor: "pointer",
        ...selectedStyle,
        ...moveSquareShadow,
        ...inCheckShadow,
        ...blastSquareShadow,
      }}
    >
      {isBlastSquare && <BlastOverlay delay={1} />}
      {children}
    </div>
  );
}

export default Square;

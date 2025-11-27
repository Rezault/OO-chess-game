import React, { useState, useEffect, useRef } from "react";
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
import { motion, AnimatePresence } from "motion/react";

const TILE_SIZE = 60;
function ChessBoard({
  gameState,
  myName,
  onAttemptMove,
  choosingPowerUpSquare,
  receivePowerUpSquare,
}) {
  const [selected, setSelected] = useState(null); // [row, col] or null
  const [moveSquares, setMoveSquares] = useState([]);
  const [activeEffect, setActiveEffect] = useState(null);

  const board = gameState?.board.grid || initialBoard;
  const turn = gameState?.turn === "WHITE" ? "w" : "b";

  // for powerups
  const prevBoardRef = useRef(board); // store prev board
  const lastEffectIdRef = useRef(null);
  const [ghostPieces, setGhostPieces] = useState([]);

  // check if a square is affected by a knight/rook powerup
  const isSquareInEffectArea = (effect, row, col) => {
    if (!effect) return false;
    const { type, row: er, col: ec } = effect;

    if (type === "KNIGHT_AOE") {
      // 3x3 around center
      return Math.abs(row - er) <= 1 && Math.abs(col - ec) <= 1;
    }

    if (type === "ROOK_BLAST") {
      // same row or same column as center
      return row === er || col === ec;
    }

    if (type === "BISHOP_SNIPER") {
      // only the target square is considered the effect area
      return row === er && col === ec;
    }

    return false;
  };

  // last effect applied for powerup
  useEffect(() => {
    if (!gameState) return;

    const {
      lastEffectType,
      lastEffectRow,
      lastEffectCol,
      lastEffectSourceRow,
      lastEffectSourceCol,
      lastEffectId,
    } = gameState;

    const prevGrid = prevBoardRef.current;
    const currGrid = board;

    if (!prevGrid || !currGrid) return;

    if (
      (lastEffectType === "KNIGHT_AOE" ||
        lastEffectType === "ROOK_BLAST" ||
        lastEffectType === "BISHOP_SNIPER") &&
      lastEffectId != null &&
      lastEffectId !== lastEffectIdRef.current
    ) {
      lastEffectIdRef.current = lastEffectId;
      // 1) record the effect so we can animate rook/knight + squares
      const effect = {
        type: lastEffectType,
        row: lastEffectRow,
        col: lastEffectCol,
        sourceRow: lastEffectSourceRow,
        sourceCol: lastEffectSourceCol,
        id: lastEffectId,
      };

      setActiveEffect(effect);

      // 2) find the victims
      const victims = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const prevPiece = prevGrid?.[r]?.[c];
          const newPiece = currGrid[r]?.[c];

          // piece existed before and this square changed
          if (!prevPiece || prevPiece === newPiece) continue;

          // is this square inside the relevant blast area?
          if (!isSquareInEffectArea(effect, r, c)) continue;

          // don't ghost kings
          if (prevPiece[1] === "k") continue;

          victims.push({
            row: r,
            col: c,
            piece: prevPiece,
          });
        }
      }

      setGhostPieces(victims);

      // 3) clear effect + ghosts after animation completes
      const timer = setTimeout(() => {
        setActiveEffect(null);
        setGhostPieces([]);
      }, 1500); // match knight + explosion timing

      // 4) update previous board snapshot to current
      prevBoardRef.current = currGrid;

      return () => clearTimeout(timer);
    }

    // No KNIGHT_AOE effect just keep prevBoard up to date
    prevBoardRef.current = currGrid;
  }, [gameState, board]);

  // figure out if I am white or black
  const myColor =
    gameState && gameState.whitePlayer === myName
      ? "w"
      : gameState && gameState.blackPlayer === myName
      ? "b"
      : "w"; // default

  const isFlipped = myColor === "b";

  // check if king is in check
  const inCheck = isKingInCheck(gameState, board, turn);
  const kingPos = inCheck ? findKing(board, turn) : null;
  const kingRow = kingPos ? kingPos[0] : null;
  const kingCol = kingPos ? kingPos[1] : null;

  // frozen piece
  const checkFrozenSquare = (row, col) => {
    if (!gameState) return false;
    const frozenRowWhite = gameState.whiteFrozenPieceRow;
    const frozenColWhite = gameState.whiteFrozenPieceCol;
    const frozenRowBlack = gameState.blackFrozenPieceRow;
    const frozenColBlack = gameState.blackFrozenPieceCol;

    return (
      (frozenRowWhite === row && frozenColWhite === col) ||
      (frozenRowBlack === row && frozenColBlack === col)
    );
  };

  // evolved piece
  const checkEvolvedSquare = (row, col) => {
    if (!gameState) return false;
    const evolvedRowWhite = gameState.whiteEvolvedPieceRow;
    const evolvedColWhite = gameState.whiteEvolvedPieceCol;
    const evolvedRowBlack = gameState.blackEvolvedPieceRow;
    const evolvedColBlack = gameState.blackEvolvedPieceCol;

    return (
      (evolvedRowWhite === row && evolvedColWhite === col) ||
      (evolvedRowBlack === row && evolvedColBlack === col)
    );
  };

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

    // check if we're choosing a square for a powerup
    if (choosingPowerUpSquare) {
      // return the row and col
      receivePowerUpSquare(row, col);
      return;
    }

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

      // check if the current piece is frozen
      if (checkFrozenSquare(row, col)) {
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
  const pieces = [];

  for (let uiRow = 0; uiRow < 8; uiRow++) {
    for (let uiCol = 0; uiCol < 8; uiCol++) {
      // map UI coords -> actual board coords
      const row = isFlipped ? 7 - uiRow : uiRow;
      const col = isFlipped ? 7 - uiCol : uiCol;

      let boardPiece = board[row][col];

      // if we have a powerup on this square, display it
      let displayPiece = boardPiece;
      if (
        gameState &&
        gameState.mysteryBoxRow == row &&
        gameState.mysteryBoxCol == col
      ) {
        displayPiece = "box";
      }

      const isLightSquare = (uiRow + uiCol) % 2 === 0;
      const isMoveSquare = moveSquares.some(([r, c]) => r === row && c === col);
      const isKingSquare = inCheck && row === kingRow && col === kingCol;

      // check for frozen pieces
      const isFrozenSquare = checkFrozenSquare(row, col);

      // check for evolved pieces
      const isEvolvedSquare = checkEvolvedSquare(row, col);

      let bgColor = isMoveSquare
        ? "#50C878"
        : isFrozenSquare
        ? "#00FFEF"
        : isEvolvedSquare
        ? "#FFD700"
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

      // check if it is a blast square
      const isBlastSquare = isSquareInEffectArea(activeEffect, row, col);
      const blastSquareShadow = isBlastSquare
        ? { boxShadow: "inset 0 0 0 3px red" }
        : {};

      // powerup animations
      const baseX = uiCol * TILE_SIZE;
      const baseY = uiRow * TILE_SIZE;

      // check for knight/rook powerup
      const isSmashPowerup =
        activeEffect &&
        (activeEffect.type === "KNIGHT_AOE" ||
          activeEffect.type === "ROOK_BLAST") &&
        activeEffect.row === row &&
        activeEffect.col === col;

      const smashAnimate = isSmashPowerup
        ? {
            x: baseX,
            y: [
              baseY, // start on square
              baseY - 40, // jump up
              baseY - 44, // shake high
              baseY - 36, // shake high
              baseY - 42, // shake high
              baseY + 6, // slam below a bit
              baseY, // settle back
            ],
            scale: [
              1, // normal
              2.8, // big as he jumps
              2.5, // tiny shrink in shake
              2.9, // bigger again
              2.7, // shake
              0.95, // squash on impact
              1, // back to normal
            ],
            rotate: [0, -3, 3, -3, 2, 0, 0],
          }
        : {
            x: baseX,
            y: baseY,
            scale: 1,
          };

      const smashTransition = isSmashPowerup
        ? {
            duration: 1.5,
            times: [0, 0.2, 0.35, 0.5, 0.6, 0.8, 1],
            easing: "ease-out",
          }
        : {
            type: "spring",
            stiffness: 500,
            damping: 30,
            mass: 0.5,
          };

      let pieceAnimate = smashAnimate;
      let pieceTransition = smashTransition;

      // bishop animation
      if (
        activeEffect &&
        activeEffect.type === "BISHOP_SNIPER" &&
        activeEffect.sourceRow === row &&
        activeEffect.sourceCol === col
      ) {
        const targetBoardRow = activeEffect.row;
        const targetBoardCol = activeEffect.col;

        // convert target board coords -> UI coords (respect flip)
        const targetUiRow = isFlipped ? 7 - targetBoardRow : targetBoardRow;
        const targetUiCol = isFlipped ? 7 - targetBoardCol : targetBoardCol;

        const targetX = targetUiCol * TILE_SIZE;
        const targetY = targetUiRow * TILE_SIZE;

        pieceAnimate = {
          x: [baseX, targetX, baseX],
          y: [baseY, targetY, baseY],
          scale: [1, 1.5, 1],
          // optional slight tilt
          rotate: [0, 10, -5, 0],
        };

        pieceTransition = {
          duration: 0.6,
          ease: "easeInOut",
          times: [0, 0.6, 1],
        };
      }

      // add squares
      squares.push(
        <div
          key={`sq-${uiRow}-${uiCol}`}
          onClick={() => handleSquareClick(row, col)}
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
          {isBlastSquare && (
            <>
              {/* Bright flash */}
              <motion.div
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: [0.8, 0.6, 0], scale: [0.3, 2, 3] }}
                transition={{ duration: 0.45, ease: "easeOut", delay: 1 }}
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
                transition={{ duration: 0.6, ease: "easeOut", delay: 1 }}
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
          )}
        </div>
      );

      if (displayPiece) {
        const pieceKey = displayPiece;
        const baseCode =
          displayPiece === "box" ? "box" : displayPiece.slice(0, 2);

        // use motion.img for animations
        pieces.push(
          <motion.img
            key={pieceKey}
            layoutId={pieceKey}
            src={pieceImages[baseCode]}
            alt={displayPiece}
            className="chess-piece"
            initial={false}
            animate={pieceAnimate}
            transition={pieceTransition}
            style={{
              userSelect: "none",
              pointerEvents: "none", // click through to squares
              transformOrigin: "50% 100%", // feels nicer (scale from feet)
            }}
          />
        );
      }
    }
  }

  // check if we have two turns
  let currTurn;
  let gameStatus;
  if (gameState) {
    gameStatus = gameState.status;
    currTurn = gameState.turn;
    if (
      (currTurn == "WHITE" && gameState.whiteExtraMove) ||
      (currTurn == "BLACK" && gameState.blackExtraMove)
    ) {
      currTurn += " [TWO TURNS]";
    }
  }

  return (
    <div
      style={{
        display: "inline-block",
        border: "4px solid #333",
        borderRadius: "8px",
        overflow: "hidden",
        padding: "0.5rem",
      }}
    >
      {choosingPowerUpSquare && (
        <div
          style={{ textAlign: "center", color: "white", fontWeight: "bold" }}
        >
          Choose a piece!
        </div>
      )}
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

      {/* chessboard */}
      <div className="chessboard">
        <div className="chessboard-grid">{squares}</div>
        <div className="pieces-layer">
          <AnimatePresence>
            {/* ghost victims */}
            {ghostPieces.map((ghost) => {
              const { row, col, piece } = ghost;

              // convert board coords -> UI coords (respect flip)
              const uiRow = isFlipped ? 7 - row : row;
              const uiCol = isFlipped ? 7 - col : col;

              const x = uiCol * TILE_SIZE;
              const y = uiRow * TILE_SIZE;

              const baseCode = piece === "box" ? "box" : piece.slice(0, 2); // "wp3" -> "wp"

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
            })}

            {/* normal pieces */}
            {pieces}
          </AnimatePresence>
        </div>
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
        Turn: {currTurn || ""}
      </div>
    </div>
  );
}

export default ChessBoard;

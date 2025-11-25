import React, { useState } from "react";
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

  const board = gameState?.board.grid || initialBoard;
  const turn = gameState?.turn === "WHITE" ? "w" : "b";

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
          }}
        ></div>
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
            animate={{
              x: uiCol * TILE_SIZE,
              y: uiRow * TILE_SIZE,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
              mass: 0.5,
            }}
            style={{
              userSelect: "none",
              pointerEvents: "none", // click through to squares
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
          <AnimatePresence>{pieces}</AnimatePresence>
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

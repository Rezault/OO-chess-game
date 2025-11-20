import { createPortal } from "react-dom";
import { EMPTY_SQUARE } from "./initialBoard";

const colorOf = (p) => (p ? p[0] : null); // "w" or "b"
const enemyOf = (colour) => (colour === "w" ? "b" : "w");

export function applyMoveIfLegal(board, from, to, currentTurn = "w", gameState) {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;

  const piece = board[fromRow][fromCol];
  if (!piece || colorOf(piece) !== currentTurn) return null; // no piece to move or piece is not your colour

  // apply move validation, make sure there's valid moves
  const validMoves = computeValidMoves(board, fromRow, fromCol, gameState);
  const isLegal = validMoves.some(([r, c]) => r === toRow && c === toCol);
  if (!isLegal) return null;

  // If move is legal, return a new board state with the move applied
  const newBoard = cloneBoard(board);
  makeMove(newBoard, fromRow, fromCol, toRow, toCol);

  return newBoard;
}

function cloneBoard(board) {
  // clone the board to simulate moves
  return board.map((row) => row.slice());
}

function makeMove(board, fromRow, fromCol, toRow, toCol) {
  // make a move on a cloned board for simulation
  const piece = board[fromRow][fromCol];
  board[fromRow][fromCol] = EMPTY_SQUARE;
  board[toRow][toCol] = piece;
}

export function computeValidMoves(board, row, col, gameState) {
  const piece = board[row][col];
  if (!piece) return [];

  // compute raw moves
  const myColor = colorOf(piece);
  const type = piece[1];
  
  let rawMoves = computeRawMoves(board, row, col);

  const valid = [];

  // validate raw moves by simulating them
  for (const [r, c] of rawMoves) {
    const newBoard = cloneBoard(board);
    makeMove(newBoard, row, col, r, c);

    if (!isKingInCheck(newBoard, myColor)) {
      valid.push([r, c]);
    }
  }

  // if en passant, add it
  if (type === "p") {
    const enRow = gameState.enPassantRow;
    const enCol = gameState.enPassantCol;
    const dir = myColor === "w" ? -1 : 1;
    if (enRow !== -1 && enCol !== -1) {
      // check if current pawn is where it should be
      const c0 = [row, col];
      const c1 = [enRow-dir, enCol+dir];
      const c2 = [enRow-dir, enCol-dir];
      if ((c0[0] === c1[0] && c0[1] === c1[1]) | (c0[0] === c2[0] && c0[1] === c2[1])) {
        valid.push([enRow, enCol]);
      }
    }
  }

  // if its a king, see if can castle
  if (type === "k" && gameState) {
    const castleMoves = computeCastlingMoves(board, row, col, myColor, gameState);
    for (const mv of castleMoves) {
      valid.push(mv);
    }
  }

  return valid;
}

function computeEnPassantMoves(board, row, col, colour, gameState) {
  if (!gameState) return [];
}

function computeCastlingMoves(board, row, col, colour, gameState) {
  const moves = [];

  const isWhite = colour === "w";
  const homeRow = isWhite ? 7 : 0;
  const kingCol = 4;

  // king must be on starting square and not in check
  if (row !== homeRow || col !== kingCol || isKingInCheck(board, colour)) return moves;

  const enemy = enemyOf(colour);
  // king side
  const canCastleKingSide = isWhite ? gameState.whiteKingSideCastle : gameState.blackKingSideCastle;
  if (canCastleKingSide) {
    // f and g file must be empty (5 and 6)
    if (!board[homeRow][5] && !board[homeRow][6]) {
      // squares king passes through: e (4), f (5), g (6) must not be under attack
      const safe =
        !isSquareAttacked(board, homeRow, 4, enemy) &&
        !isSquareAttacked(board, homeRow, 5, enemy) &&
        !isSquareAttacked(board, homeRow, 6, enemy);

      if (safe) {
        moves.push([homeRow, 6]);
      }
    }
  }

  // queen side
  const canCastleQueenSide = isWhite ? gameState.whiteQueenSideCastle : gameState.blackQueenSideCastle;
  if (canCastleQueenSide) {
    // d, c, b files must be empty (3,2,1)
    if (!board[homeRow][3] && !board[homeRow][2] && !board[homeRow][1]) {
      // squares must be safe
      const safe =
        !isSquareAttacked(board, homeRow, 4, enemy) &&
        !isSquareAttacked(board, homeRow, 3, enemy) &&
        !isSquareAttacked(board, homeRow, 2, enemy);

      if (safe) {
        moves.push([homeRow, 2]);
      }
    }
  }

  return moves;
}

function computeRawMoves(board, row, col) {
  const piece = board[row][col];
  if (!piece) return [];

  let moves = [];

  const myColor = colorOf(piece);

  // pawn movement
  if (piece[1] === "p") {
    if (myColor === "w") {
      // WHITE PAWN
      // forward moves
      if (row === 6) {
        // starting square: can go 1 or 2 forward if not blocked
        if (board[5][col] === EMPTY_SQUARE) {
          moves.push([5, col]);
          if (board[4][col] === EMPTY_SQUARE) {
            moves.push([4, col]);
          }
        }
      } else {
        if (row > 0 && board[row - 1][col] === EMPTY_SQUARE) {
          moves.push([row - 1, col]);
        }
      }

      // captures
      const nRow = row - 1;
      const lCol = col - 1;
      const rCol = col + 1;

      if (nRow >= 0 && lCol >= 0) {
        const target = board[nRow][lCol];
        if (target !== EMPTY_SQUARE && colorOf(target) !== myColor) {
          moves.push([nRow, lCol]);
        }
      }

      if (nRow >= 0 && rCol <= 7) {
        const target = board[nRow][rCol];
        if (target !== EMPTY_SQUARE && colorOf(target) !== myColor) {
          moves.push([nRow, rCol]);
        }
      }

    } else if (myColor === "b") {
      // BLACK PAWN
      // forward moves
      if (row === 1) {
        // starting square: can go 1 or 2 forward (down the board)
        if (board[2][col] === EMPTY_SQUARE) {
          moves.push([2, col]);
          if (board[3][col] === EMPTY_SQUARE) {
            moves.push([3, col]);
          }
        }
      } else {
        if (row < 7 && board[row + 1][col] === EMPTY_SQUARE) {
          moves.push([row + 1, col]);
        }
      }

      // captures
      const nRow = row + 1;
      const lCol = col - 1;
      const rCol = col + 1;

      if (nRow <= 7 && lCol >= 0) {
        const target = board[nRow][lCol];
        if (target !== EMPTY_SQUARE && colorOf(target) !== myColor) {
          moves.push([nRow, lCol]);
        }
      }

      if (nRow <= 7 && rCol <= 7) {
        const target = board[nRow][rCol];
        if (target !== EMPTY_SQUARE && colorOf(target) !== myColor) {
          moves.push([nRow, rCol]);
        }
      }
    }

    // TODO: promotions + en passant for each color
  }

  // KNIGHT
  if (piece[1] === "n") {
    // we have 8 cases to check. it's just the L pattern of a knight
    const toCheck = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [2, -1],
      [2, 1],
      [1, -2],
      [1, 2]
    ];

    for (const [r1, c1] of toCheck) {
      const r = row + r1;
      const c = col + c1;
      // check that we are in bounds
      if (r < 0 || r > 7 || c < 0 || c > 7) continue;

      const target = board[r][c];

      // check if empty square or enemy piece
      if (target === EMPTY_SQUARE || colorOf(target) !== myColor) {
        moves.push([r, c]);
      }
    }
  }

  // BISHOP
  if (piece[1] === "b") {
    const toCheck = [
      [-1, -1], // up-left
      [-1, 1], // up-right
      [1, -1], // down-left
      [1, 1] // down-right 
    ];

    for (const [r1, c1] of toCheck) {
      let r = row + r1;
      let c = col + c1;

      while (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
        const target = board[r][c];
        if (target === EMPTY_SQUARE) {
          // no piece, we can add to valid moves
          moves.push([r, c]);
        } else {
          // we found a piece, stop searching.
          // if enemy piece, then we can capture it, so add to the list
          if (colorOf(target) !== myColor) {
            moves.push([r, c]);
          }
          break;
        }

        // keep the loop going
        r += r1;
        c += c1;
      }
    }
  }

  // ROOK
  if (piece[1] === "r") {
    // just need to check 4 directions
    const toCheck = [
      [-1, 0], // left row
      [1, 0], // right row
      [0, -1], // up
      [0, 1] // down 
    ];

    for (const [r1, c1] of toCheck) {
      let r = row + r1;
      let c = col + c1;

      while (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
        const target = board[r][c];
        if (target === EMPTY_SQUARE) {
          // no piece, we can add to valid moves
          moves.push([r, c]);
        } else {
          // we found a piece, stop searching.
          // if enemy piece, then we can capture it, so add to the list
          if (colorOf(target) !== myColor) {
            moves.push([r, c]);
          }
          break;
        }

        // keep the loop going
        r += r1;
        c += c1;
      }
    }
  }

  // QUEEN
  if (piece[1] === "q") {
    // combine rook and bishop movement
    const toCheck = [
      [-1, -1], // up-left
      [-1, 1], // up-right
      [1, -1], // down-left
      [1, 1], // down-right
      [-1, 0], // left row
      [1, 0], // right row
      [0, -1], // up
      [0, 1] // down 
    ];

    for (const [r1, c1] of toCheck) {
      let r = row + r1;
      let c = col + c1;

      while (r >= 0 && r <= 7 && c >= 0 && c <= 7) {
        const target = board[r][c];
        if (target === EMPTY_SQUARE) {
          // no piece, we can add to valid moves
          moves.push([r, c]);
        } else {
          // we found a piece, stop searching.
          // if enemy piece, then we can capture it, so add to the list
          if (colorOf(target) !== myColor) {
            moves.push([r, c]);
          }
          break;
        }

        // keep the loop going
        r += r1;
        c += c1;
      }
    }
  }

  // KING
  if (piece[1] === "k") {
    // king can only move one square on any side
    const toCheck = [
      [-1, -1], // up-left
      [-1, 1], // up-right
      [1, -1], // down-left
      [1, 1], // down-right
      [-1, 0], // left row
      [1, 0], // right row
      [0, -1], // up
      [0, 1] // down 
    ];

    for (const [r1, c1] of toCheck) {
      let r = row + r1;
      let c = col + c1;

      // stay on board
      if (r < 0 || r > 7 || c < 0 || c > 7) continue;

      const target = board[r][c];
      if (target === EMPTY_SQUARE || colorOf(target) !== myColor) {
        moves.push([r, c]);
      }
    }

    // TODO: castling and checks
  }

  return moves;
}

function isSquareAttacked(board, row, col, attackerColour) {
  // loop through all squares and find each piece of attackerColour
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let piece = board[i][j];
      if (piece === EMPTY_SQUARE || colorOf(piece) !== attackerColour) continue;

      // compute RAW moves (no checks or special rules)
      const validMoves = computeRawMoves(board, i, j);
      for (const [r, c] of validMoves) {
        if (r === row && col === c) {
          return true;
        }
      }
    }
  }

  return false;
}

export function findKing(board, color) {
  // loop through all squares and find the king of given colour
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece[1] === "k" && colorOf(piece) === color) {
        return [r, c];
      }
    }
  }
  return null; // should never happen in a valid game
}

export function isKingInCheck(board, color) {
  // find the king and see if the square he's on is being attacked
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  const [kr, kc] = kingPos;
  const enemyColor = color === "w" ? "b" : "w";
  return isSquareAttacked(board, kr, kc, enemyColor);
}

// check that we have any legal moves for a player
export function hasAnyLegalMove(board, color) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || colorOf(piece) !== color) continue;

      const moves = computeValidMoves(board, r, c);
      if (moves.length > 0) return true;
    }
  }
  return false;
}

// check the game status
export function getGameStatus(board, colorToMove) {
  const inCheck = isKingInCheck(board, colorToMove);
  const hasMove = hasAnyLegalMove(board, colorToMove);

  if (inCheck && !hasMove) return "CHECKMATE";
  if (!inCheck && !hasMove) return "STALEMATE";
  if (inCheck) return "CHECK";
  return "NORMAL";
}

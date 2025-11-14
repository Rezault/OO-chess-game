import { createPortal } from "react-dom";
import { EMPTY_SQUARE } from "./initialBoard";

// piece is like "wp" or "bk"
const pieceColor = (piece) => (piece ? piece[0] : null); // "w" or "b"

export function applyMoveIfLegal(board, from, to, currentTurn = "w") {
  const [fromRow, fromCol] = from;
  const [toRow, toCol] = to;

  const piece = board[fromRow][fromCol];
  if (!piece) return null; // no piece to move

  const color = pieceColor(piece);
  if (color !== currentTurn) return null; // not your turn

  const target = board[toRow][toCol];
  if (target && pieceColor(target) === color) return null; // can't capture own piece

  // TODO: move validation, custom rules

  // If move is legal, return a new board state with the move applied
  const newBoard = board.map((row) => row.slice());
  newBoard[fromRow][fromCol] = EMPTY_SQUARE;
  newBoard[toRow][toCol] = piece;

  return newBoard;
}

const colorOf = (p) => (p ? p[0] : null); // "w" or "b"
export function computeValidMoves(board, row, col) {
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
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

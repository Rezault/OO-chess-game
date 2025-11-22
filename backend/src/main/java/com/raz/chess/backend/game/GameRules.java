package com.raz.chess.backend.lobby;

import java.util.ArrayList;
import java.util.List;

public class GameRules {
	private static final String EMPTY = null;
	
	private static char colourOf(String piece) {
		return piece == null ? '-' : piece.charAt(0); // 'w' or 'b'
	}
	
	private static char typeOf(String piece) {
		return piece == null ? '-' : piece.charAt(1); // 'p', 'n', 'k', etc.
	}
	
	// raw moves
	private static List<int[]> computeRawMoves(Board board, int row, int col, boolean forAttack) {
		String piece = board.get(row, col);
		List<int[]> moves = new ArrayList<>();
		if (piece == null) return moves;
		
		char colour = colourOf(piece);
		char type = typeOf(piece);
		
		// compute moves for each piece type
		// bishop, rook, queen can all be computed from the same function
		if (type == 'p') {
			computePawnMoves(board, row, col, colour, forAttack, moves);
		} else if (type == 'n') {
			computeKnightMoves(board, row, col, colour, moves);
		} else if (type == 'b') {
			// bishop only goes diagonally, check up left/right and down left/right
			computeSlidingMoves(board, row, col, colour, moves,
                    new int[][]{{-1,-1},{-1,1},{1,-1},{1,1}});
		} else if (type == 'r') {
			// check up, down, left, right from rook
			computeSlidingMoves(board, row, col, colour, moves,
                    new int[][]{{-1,0},{1,0},{0,-1},{0,1}});
		} else if (type == 'q') {
			// combine rook and bishop
			computeSlidingMoves(board, row, col, colour, moves,
                    new int[][]{{-1,-1},{-1,1},{1,-1},{1,1},{-1,0},{1,0},{0,-1},{0,1}});
		} else if (type == 'k') {
			computeKingMoves(board, row, col, colour, moves);
		}
		
		return moves;
	}
	
	private static boolean inBounds(int r, int c) {
        return r >= 0 && r < 8 && c >= 0 && c < 8;
    }
	
	// -- PIECE MOVES -- //
	private static void computePawnMoves(Board board, int row, int col, char colour, boolean forAttack, List<int[]> moves) {
		// determine if we're white or black and which direction we're heading
		int dir = (colour == 'w') ? -1 : 1;
        int startRow = (colour == 'w') ? 6 : 1;
        int nextRow = row + dir;
        
        // forward moves (no capture)
        if (!forAttack) {
            if (inBounds(nextRow, col) && board.get(nextRow, col) == EMPTY) {
            	// add first row, then check the row after
                moves.add(new int[]{nextRow, col});
                int nextRow2 = row + 2 * dir;
                if (row == startRow && inBounds(nextRow2, col)
                        && board.get(nextRow2, col) == EMPTY) {
                    moves.add(new int[]{nextRow2, col});
                }
            }
        }
        
        // diagonals/captures
        int[] diagCols = {col - 1, col + 1};
        for (int dc : diagCols) {
            if (!inBounds(nextRow, dc)) continue;
            
            // get the target on each diagonal, check if it's not the same colour
            String target = board.get(nextRow, dc);
            if (target != EMPTY && colourOf(target) != colour) {
                moves.add(new int[]{nextRow, dc});
            } else if (forAttack) {
                // "control squares" even when empty, add them here
            }
        }
	}
	
	private static void addEnPassantMoves(GameState gameState, int row, int col, List<int[]> moves) {
		// check if we have a target for en passant
		int targetRow = gameState.getEnPassantRow();
		int targetCol = gameState.getEnPassantCol();
		if (targetRow < 0 || targetCol < 0) return;
		
		Board board = gameState.getBoard();
		String piece = board.get(row, col);
		if (piece == null | typeOf(piece) != 'p') return;
		
		char colour = colourOf(piece);
		int dir = (colour == 'w') ? -1 : 1;
		
		// en passant square needs to be one row ahead and one column over
		// piece must be to the column either to the left or right of the current pawn
		if (row + dir == targetRow && Math.abs(col - targetCol) == 1) {
			int capturedRow = targetRow - dir;
			String captured = board.get(capturedRow, targetCol);
			if (captured != null && colourOf(captured) != colour && typeOf(captured) == 'p' && board.get(targetRow, targetCol) == EMPTY) {
				moves.add(new int[]{targetRow, targetCol});
			}
		}
	}
	
	private static void computeKnightMoves(Board board, int row, int col, char colour, List<int[]> moves) {
		// 8 directions for knight
		int[][] toCheck = {
				{-2,-1},{-2,1},{-1,-2},{-1,2},
	            {1,-2},{1,2},{2,-1},{2,1}
		};
		
		// loop through each
		for (int[] d : toCheck) {
            int r = row + d[0];
            int c = col + d[1];
            if (!inBounds(r, c)) continue;
            String target = board.get(r, c);
            if (target == EMPTY || colourOf(target) != colour) {
                moves.add(new int[]{r, c});
            }
        }
	}
	
	private static void computeSlidingMoves(Board board, int row, int col, char colour, List<int[]> moves, int[][] directions) {
		// bishop, rook, queen
		// loop through directions given
		for (int[] dir : directions) {
			 int r = row + dir[0];
	         int c = col + dir[1];
	         while (inBounds(r, c)) {
	        	 String target = board.get(r, c);
	             if (target == EMPTY) {
	            	 moves.add(new int[]{r, c});
	             } else {
	            	 if (colourOf(target) != colour) {
	            		 moves.add(new int[]{r, c});
	            	 }
	                 break; // blocked
	             }
	             r += dir[0];
	             c += dir[1];
	         }
		}
	}
	
	private static void computeKingMoves(Board board, int row, int col, char colour, List<int[]> moves) {
		int[][] toCheck = {
				{-1,-1},{-1,0},{-1,1},
				{0,-1},{0,1},
				{1,-1},{1,0},{1,1}
        };
		
		for (int[] d : toCheck) {
			int r = row + d[0];
            int c = col + d[1];
            if (!inBounds(r, c)) continue;
            String target = board.get(r, c);
            if (target == EMPTY || colourOf(target) != colour) {
                moves.add(new int[]{r, c});
            }
		}
		// TODO: castling later
	}
	
	// -- ATTACK/CHECK -- //
	public static boolean isSquareAttacked(Board board, int targetRow, int targetCol, char attackerColour) {
		// loop through every piece and check if a certain square is being attacked
		for (int r = 0; r < 8; r++) {
            for (int c = 0; c < 8; c++) {
                String piece = board.get(r, c);
                if (piece == null || colourOf(piece) != attackerColour) continue;

                // use raw moves from the attacker square
                List<int[]> rawMoves = computeRawMoves(board, r, c, true);
                for (int[] mv : rawMoves) {
                    if (mv[0] == targetRow && mv[1] == targetCol) {
                        return true;
                    }
                }
            }
        }
        return false;
	}
	
	public static int[] findKing(Board board, char colour) {
		// pretty straight forward just find the king on the board
		for (int r = 0; r < 8; r++) {
            for (int c = 0; c < 8; c++) {
                String piece = board.get(r, c);
                if (piece != null && typeOf(piece) == 'k' && colourOf(piece) == colour) {
                    return new int[]{r, c};
                }
            }
        }
        return null;
	}
	
	public static boolean isKingInCheck(Board board, char colour) {
		int[] kingPos = findKing(board, colour);
		if (kingPos == null) return false; // shouldn't happen in a game
		char enemy = (colour == 'w') ? 'b' : 'w';
	    return isSquareAttacked(board, kingPos[0], kingPos[1], enemy);
	}
	
	public static boolean hasAnyLegalMove(GameState gameState, char colour) {
		Board board = gameState.getBoard();
		for (int r = 0; r < 8; r++) {
            for (int c = 0; c < 8; c++) {
                String piece = board.get(r, c);
                if (piece == null || colourOf(piece) != colour) continue;
                List<int[]> legal = computeLegalMoves(gameState, r, c);
                if (!legal.isEmpty()) return true;
            }
        }
        return false;
	}
	
	// -- LEGAL MOVES -- //
	public static List<int[]> computeLegalMoves(GameState gameState, int row, int col) {
		Board board = gameState.getBoard();
		String piece = board.get(row, col);
        List<int[]> result = new ArrayList<>();
        if (piece == null) return result;

        char color = colourOf(piece);
        List<int[]> raw = computeRawMoves(board, row, col, false);
        if (typeOf(piece) == 'p') {
        	addEnPassantMoves(gameState, row, col, raw);
        }
        	
        // loop through all raw moves
        for (int[] move : raw) {
            int r = move[0], c = move[1];
            
            // copy the board and simulate this move
            Board copy = board.copy();
            boolean isEnPassant = isEnPassantMove(gameState, row, col, r, c);
            
            copy.move(row, col, r, c);
            
            if (isEnPassant) {
            	removeEnPassantPawn(copy, color, r, c);
            }

            // if the king is safe, add this as a valid move
            if (!isKingInCheck(copy, color)) {
                result.add(new int[]{r, c});
            }
        }
        
        // If it's a king, add castling squares if allowed
        if (typeOf(piece) == 'k') {
            addCastlingMoves(gameState, row, col, color, result);
        }
        
        return result;
	}
	
	private static void addCastlingMoves(GameState gameState, int row, int col, char colour, List<int[]> moves) {
		Board board = gameState.getBoard();
		boolean isWhite = (colour == 'w');
		
		int homeRow = isWhite ? 7 : 0;
		int kingCol = 4;
		
		if (row != homeRow || col != kingCol) {
			return; // king not on initial square so can't castle
		}
		
		if (isKingInCheck(board, colour)) {
			return; // king is in check, can't castle
		}
		
		// king side castling
		boolean canKingSideCastle = isWhite ? gameState.isWhiteKingSideCastle() : gameState.isBlackKingSideCastle();
		
		if (canKingSideCastle) {
			int rookCol = 7;
			// f file and g file (5 and 6) in between king and rook, gotta check that they're empty and not under attack
			if (board.get(homeRow, 5) == null && board.get(homeRow, 6) == null) {
				// check that the rook is where it should be
				String rook = board.get(homeRow, rookCol);
				if (rook != null && colourOf(rook) == colour) {
					if (!isSquareAttacked(board, homeRow, 4, enemyOf(colour)) &&
			            !isSquareAttacked(board, homeRow, 5, enemyOf(colour)) &&
			            !isSquareAttacked(board, homeRow, 6, enemyOf(colour))) {
	
			            // castling move = king goes to g-file (6)
			            moves.add(new int[]{homeRow, 6});
			        }
				}
			}
		}
		
		// queen side castling
		boolean canQueenSide = isWhite
		            ? gameState.isWhiteQueenSideCastle()
		            : gameState.isBlackQueenSideCastle();

		if (canQueenSide) {
			int rookCol = 0;
		    // squares between: d (3), c (2), b (1)
		    if (board.get(homeRow, 3) == null &&
		        board.get(homeRow, 2) == null &&
		        board.get(homeRow, 1) == null) {
		    	
		    	String rook = board.get(homeRow, rookCol);
		    	if (rook != null && colourOf(rook) == colour) {
			        // squares king passes: e (4), d (3), c (2)
			        if (!isSquareAttacked(board, homeRow, 4, enemyOf(colour)) &&
			            !isSquareAttacked(board, homeRow, 3, enemyOf(colour)) &&
			            !isSquareAttacked(board, homeRow, 2, enemyOf(colour))) {
	
			            // castling move = king goes to c-file (2)
			            moves.add(new int[]{homeRow, 2});
			        }
		    	}
		    }
		}
	}
	
	private static char enemyOf(char color) {
	    return color == 'w' ? 'b' : 'w';
	}
	
	public static Board applyMoveIfLegal(GameState gameState, int fromRow, int fromCol, int toRow, int toCol, char currentColour) {
		Board board = gameState.getBoard();
		String piece = board.get(fromRow, fromCol);
        if (piece == null || colourOf(piece) != currentColour) return null;

        // compute legal moves and check if this particular move is in that list
        List<int[]> legalMoves = computeLegalMoves(gameState, fromRow, fromCol);
        boolean isLegal = legalMoves.stream()
                .anyMatch(mv -> mv[0] == toRow && mv[1] == toCol);
        
        // if it isn't legal just return null
        if (!isLegal) return null;

        Board copy = board.copy();
        boolean isEnPassant = isEnPassantMove(gameState, fromRow, fromCol, toRow, toCol);
        copy.move(fromRow, fromCol, toRow, toCol);
        if (isEnPassant) {
        	removeEnPassantPawn(copy, currentColour, toRow, toCol);
        }
        
        return copy;
	}
	
	private static boolean isEnPassantMove(GameState gameState, int fromRow, int fromCol, int toRow, int toCol) {
		Board board = gameState.getBoard();
		String piece = board.get(fromRow, fromCol);
		if (piece == null || typeOf(piece) != 'p') {
            return false;
        }

        if (gameState.getEnPassantRow() != toRow || gameState.getEnPassantCol() != toCol) {
            return false;
        }

        if (board.get(toRow, toCol) != EMPTY) {
            return false;
        }

        int dir = colourOf(piece) == 'w' ? -1 : 1;
        return (toRow - fromRow) == dir && Math.abs(fromCol - toCol) == 1;
	}
	
	private static void removeEnPassantPawn(Board board, char colour, int toRow, int toCol) {
		int capturedRow = toRow + (colour == 'w' ? 1 : -1);
        board.set(capturedRow, toCol, null);
	}
	
	public static GameState.Status evaluateStatus(GameState gameState, char colourToMove) {
		Board board = gameState.getBoard();
		boolean inCheck = isKingInCheck(board, colourToMove);
	    boolean hasMove = hasAnyLegalMove(gameState, colourToMove);

	    if (inCheck && !hasMove) return GameState.Status.CHECKMATE;
	    if (!inCheck && !hasMove) return GameState.Status.STALEMATE;
	    return GameState.Status.IN_PROGRESS;
	}
}

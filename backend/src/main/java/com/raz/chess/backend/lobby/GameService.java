package com.raz.chess.backend.lobby;

import java.util.Random;

import org.springframework.stereotype.Service;

@Service
public class GameService {
	private GameState currentGame;
	
	public synchronized GameState startGame(LobbyState lobby) {
		String white = lobby.getPlayer1();
		String black = lobby.getPlayer2();
		
		currentGame = new GameState(white, black, GameState.Status.IN_PROGRESS, "WHITE", new Board());
		resetMysteryBoxTime();
		
		return currentGame;
	}
	
	public synchronized GameState getCurrentGame() {
		return currentGame;
	}
	
	public synchronized GameState applyMove(Move move) {
		// check that we have a game and it is in progress
		if (currentGame == null) return null;
		if (currentGame.getStatus() != GameState.Status.IN_PROGRESS) return null;
		
		// check if it's the right player's turn
		String player = move.getPlayer();
		String expectedPlayer = currentGame.getTurn().equals("WHITE") ? currentGame.getWhitePlayer() : currentGame.getBlackPlayer();
		if (!expectedPlayer.equals(player)) return null;
		
		Board board = currentGame.getBoard();
		int fromRow = move.getFromRow();
		int fromCol = move.getFromCol();
		int toRow = move.getToRow();
		int toCol = move.getToCol();
		
		// check the piece at the square
		String piece = board.get(fromRow, fromCol);
		if (piece == null) return null;
		
		char colour = piece.charAt(0);
		char type = piece.charAt(1);
		
		// move validation. get the current colour to move and apply the new move if legal
		char colourToMove = currentGame.getTurn().equals("WHITE") ? 'w' : 'b';
		Board newBoard = GameRules.applyMoveIfLegal(currentGame, fromRow, fromCol, toRow, toCol, colourToMove);
		
		if (newBoard == null) {
			return null;  // illegal move
		}
		
		// handle pawn promotion if applicable
        if (type == 'p') {
        	boolean reachedEnd = (colour == 'w' && toRow == 0) || (colour == 'b' && toRow == 7);
            if (reachedEnd) {
            	String promotion = validatePromotion(move.getPromotion());
            	
            	// in the client we're using motion/react for animations, and each piece needs a unique id
            	// e.g. if the e pawn (5th pawn) promotes, then we'll just do
            	// wqp5 (white queen pawn 5) so that we wont have conflicting ids between promotions and existing pieces
                newBoard.set(toRow, toCol, "" + colour + promotion + type + piece.charAt(2));
            }
        }
        
        // update en passant square
        currentGame.setEnPassantRow(-1);
        currentGame.setEnPassantCol(-1);
        if (type == 'p' && Math.abs(fromRow - toRow) == 2) {
        	int dir = (colour == 'w') ? -1 : 1;
        	currentGame.setEnPassantRow(fromRow + dir);
        	currentGame.setEnPassantCol(fromCol);
        }
		
		// check if it was a king or rook move
		boolean isKingMove = (type == 'k');
		boolean isRookMove = (type == 'r');
		
		// check if it was castle; row remains the same, column changes by 2
		// can be either queen or king side castling, depends what column we move to
		if (isKingMove && fromRow == toRow && Math.abs(fromCol - toCol) == 2) {
			if (toCol == 6) {
				// king side
				newBoard.move(fromRow, 7, fromRow, 5);
			} else if (toCol == 2) {
				// queen side
				newBoard.move(fromRow, 0, fromRow, 3);
			}
			
			// update castling rights
			if (colour == 'w') {
				currentGame.setWhiteKingSideCastle(false);
				currentGame.setWhiteQueenSideCastle(false);
			} else {
				currentGame.setBlackKingSideCastle(false);
				currentGame.setBlackQueenSideCastle(false);
			}
		} else if (isKingMove) {
			// normal king move, turn off castling
			if (colour == 'w') {
				currentGame.setWhiteKingSideCastle(false);
				currentGame.setWhiteQueenSideCastle(false);
			} else {
				currentGame.setBlackKingSideCastle(false);
				currentGame.setBlackQueenSideCastle(false);
			}
		} else if (isRookMove) {
			// rook moved, depending which one we must update castling rights
			if (colour == 'w') {
				if (fromRow == 7 && fromCol == 7) currentGame.setWhiteKingSideCastle(false);
				if (fromRow == 7 && fromCol == 0) currentGame.setWhiteQueenSideCastle(false);
			} else {
				if (fromRow == 0 && fromCol == 7) currentGame.setBlackKingSideCastle(false);
				if (fromRow == 0 && fromCol == 0) currentGame.setBlackQueenSideCastle(false);
			}
		}
		
		// check if the piece passes through a mystery box. if it does, award the player
		int mysteryBoxRow = currentGame.getMysteryBoxRow();
		int mysteryBoxCol = currentGame.getMysteryBoxCol();
		if (passedThroughMysteryBox(fromRow, fromCol, toRow, toCol, mysteryBoxRow, mysteryBoxCol)) {
			currentGame.setMysteryBoxRow(-1);
			currentGame.setMysteryBoxCol(-1);
			
			resetMysteryBoxTime();
			
			if (colour == 'w') {
				currentGame.setWhitePlayerPowerUp("Test Power");
			} else {
				currentGame.setBlackPlayerPowerUp("Test Power");
			}
		}
		
		// check if we need to spawn mystery box
		int movesUntilMysteryBox = currentGame.getMovesUntilMysteryBox();
		if (movesUntilMysteryBox <= 0 && mysteryBoxRow == -1 && mysteryBoxCol == -1) {
			spawnMysteryBox(board);
		}
		
		// decrease counter by 1
		currentGame.setMovesUntilMysteryBox(movesUntilMysteryBox - 1);
		
		// set the board of the current game to the new board
		currentGame.setBoard(newBoard);
		
		// change turn
		currentGame.setTurn(currentGame.getTurn().equals("WHITE") ? "BLACK" : "WHITE");
		
		// update game status
		char nextColor = currentGame.getTurn().equals("WHITE") ? 'w' : 'b';
        GameState.Status status = GameRules.evaluateStatus(currentGame, nextColor);
        currentGame.setStatus(status);
		
		return currentGame;
	}
	
	 private String validatePromotion(String promotion) {
         if (promotion == null || promotion.isBlank()) {
                 return "q";
         }

         char type = Character.toLowerCase(promotion.charAt(0));
         if (type == 'q' || type == 'r' || type == 'b' || type == 'n') {
                 return String.valueOf(type);
         }

         return "q";
	 }
	 
	 private void resetMysteryBoxTime() {
		// reset counter for mystery box spawn
		Random r = new Random();
		int low = 3;
		int high = 8;		
		int result = r.nextInt(high-low) + low;
		currentGame.setMovesUntilMysteryBox(result);
	 }
	 
	 private void spawnMysteryBox(Board board) {
		// get random square and spawn the box
		int randRow = (int)(Math.random() * 8);
		int randCol = (int)(Math.random() * 8);
					
		while (board.get(randRow, randCol) != null) {
			randRow = (int)(Math.random() * 8);
			randCol = (int)(Math.random() * 8);
		}
					
		currentGame.setMysteryBoxRow(randRow);
		currentGame.setMysteryBoxCol(randCol);
	 }
	 
	 private boolean passedThroughMysteryBox(int fromRow, int fromCol, int toRow, int toCol, int boxRow, int boxCol) {
		if (boxRow < 0 || boxCol < 0) return false;
		
		// direction of movement in row/col
	    int dRow = Integer.compare(toRow, fromRow); // -1, 0, or 1
	    int dCol = Integer.compare(toCol, fromCol); // -1, 0, or 1

	    int r = fromRow;
	    int c = fromCol;
	    
	    while (true) {
	        // did we pass over the box?
	        if (r == boxRow && c == boxCol) {
	            return true;
	        }

	        // reached destination: stop
	        if (r == toRow && c == toCol) {
	            break;
	        }

	        r += dRow;
	        c += dCol;
	    }

	    return false;
	 }
}

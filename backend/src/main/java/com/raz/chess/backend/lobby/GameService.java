package com.raz.chess.backend.lobby;

import org.springframework.stereotype.Service;

@Service
public class GameService {
	private GameState currentGame;
	
	public synchronized GameState startGame(LobbyState lobby) {
		String white = lobby.getPlayer1();
		String black = lobby.getPlayer2();
		
		currentGame = new GameState(white, black, GameState.Status.IN_PROGRESS, "WHITE", new Board());
		
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
                newBoard.set(toRow, toCol, "" + colour + promotion);
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
}

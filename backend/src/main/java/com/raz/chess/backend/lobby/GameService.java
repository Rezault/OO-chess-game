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
		
		// move validation. get the current colour to move and apply the new move if legal
		char colourToMove = currentGame.getTurn().equals("WHITE") ? 'w' : 'b';
		Board newBoard = GameRules.applyMoveIfLegal(board, fromRow, fromCol, toRow, toCol, colourToMove);
		
		if (newBoard == null) {
			return null;  // illegal move
		}
		
		// set the board of the current game to the new board
		currentGame.setBoard(newBoard);
		
		// change turn
		currentGame.setTurn(currentGame.getTurn().equals("WHITE") ? "BLACK" : "WHITE");
		
		// update game status
		char nextColor = currentGame.getTurn().equals("WHITE") ? 'w' : 'b';
        GameState.Status status = GameRules.evaluateStatus(newBoard, nextColor);
        currentGame.setStatus(status);
		
		return currentGame;
	}
}

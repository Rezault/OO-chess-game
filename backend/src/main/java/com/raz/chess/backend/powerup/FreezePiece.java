package com.raz.chess.backend.powerup;

import com.raz.chess.backend.game.Board;
import com.raz.chess.backend.game.GameState;

public class FreezePiece implements PowerUp {
	@Override
	public String name() {
		return "Freeze Piece";
	}
	
	@Override
	public boolean activate(GameState game, PowerUpMessage message, char colour) {
		Board board = game.getBoard();
		if (board == null) return false;
		
		int row = message.getRow();
		int col = message.getCol();
		
		if (row == -1 || col == -1) return false;
		
		String piece = board.get(row, col);
		if (piece == null || piece.charAt(0) == colour || piece.charAt(1) == 'k') return false;
		
		// all checks pass, time to set the frozen piece
		if (colour == 'w') {
			game.setBlackFrozenPieceRow(row);
			game.setBlackFrozenPieceCol(col);
		} else {
			game.setWhiteFrozenPieceRow(row);
			game.setWhiteFrozenPieceCol(col);
		}
		
		return true;
	}
}

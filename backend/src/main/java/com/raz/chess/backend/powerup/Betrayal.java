package com.raz.chess.backend.powerup;

import com.raz.chess.backend.game.Board;
import com.raz.chess.backend.game.GameState;


public class Betrayal implements PowerDown {	
	@Override
	public void activate(GameState game, PowerDownMessage message, Board board) {
		int fromRow = message.getFromRow();
		int fromCol = message.getFromCol();
		int toRow = message.getToRow();
		int toCol = message.getToCol();
		
		String piece = board.get(toRow, toCol);
		if (piece == null) return;
		
		char type = piece.charAt(1);
		char colour = message.getColour();
		char opponentColour = colour == 'w' ? 'b' : 'w';
		
		// make sure to name piece with new id every time for client rendering
		int highest = 0;
		for (int r = 0; r < 8; r++) {
			for (int c = 0; c < 8; c ++) {
				String currPiece = board.get(r, c);
				if (currPiece != null && currPiece.charAt(0) == opponentColour && currPiece.charAt(1) == type) {
					// replace all letters with nothing. we want just the numbers
					int num = Integer.parseInt(currPiece.replaceAll("[^\\d]", ""));
					if (num > highest) { highest = num; }
				}
			}
		}
		
		// new piece is gonna be the same except opponent colour
		String newPiece = "" + opponentColour + type + String.valueOf(highest+1);
		
		board.set(toRow, toCol, newPiece);
		game.setLastEffectType("BETRAYAL");
		game.setLastEffectSourceRow(fromRow);
		game.setLastEffectSourceCol(fromCol);
		game.setLastEffectRow(toRow);
		game.setLastEffectCol(toCol);
	}
}

package com.raz.chess.backend.powerup;

import com.raz.chess.backend.game.Board;
import com.raz.chess.backend.game.GameState;


public class Disintegration implements PowerDown {	
	@Override
	public void activate(GameState game, PowerDownMessage message, Board board) {
		int fromRow = message.getFromRow();
		int fromCol = message.getFromCol();
		int toRow = message.getToRow();
		int toCol = message.getToCol();
		
		board.set(toRow, toCol, null);
		game.setLastEffectType("DISINTEGRATION");
		game.setLastEffectSourceRow(fromRow);
		game.setLastEffectSourceCol(fromCol);
		game.setLastEffectRow(toRow);
		game.setLastEffectCol(toCol);
	}
}

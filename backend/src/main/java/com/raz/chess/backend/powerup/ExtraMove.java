package com.raz.chess.backend.powerup;

import com.raz.chess.backend.game.GameState;

public class ExtraMove implements PowerUp {
	@Override
	public String name() {
		return "Extra Move";
	}
	
	@Override
	public boolean activate(GameState game, PowerUpMessage message, char colour) {
		if (colour == 'w') {
			game.setWhiteExtraMove(true);
		} else {
			game.setBlackExtraMove(true);
		}
		
		return true;
	}
}

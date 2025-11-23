package com.raz.chess.backend.powerup;

import com.raz.chess.backend.game.GameState;

public interface PowerUp {
	String name();
	
	boolean activate(GameState game, PowerUpMessage message, char colour);
}

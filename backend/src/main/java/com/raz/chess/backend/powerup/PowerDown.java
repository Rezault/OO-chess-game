package com.raz.chess.backend.powerup;

import com.raz.chess.backend.game.Board;
import com.raz.chess.backend.game.GameState;

public interface PowerDown {
	void activate(GameState game, PowerDownMessage message, Board board);
}

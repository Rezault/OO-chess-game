package com.raz.chess.backend.lobby;

import org.springframework.stereotype.Service;

@Service
public class GameService {
	private GameState currentGame;
	
	public synchronized GameState startGame(LobbyState lobby) {
		String white = lobby.getPlayer1();
		String black = lobby.getPlayer2();
		
		currentGame = new GameState(white, black, GameState.Status.IN_PROGRESS, "WHITE");
		
		return currentGame;
	}
	
	public synchronized GameState getCurrentGame() {
		return currentGame;
	}
}

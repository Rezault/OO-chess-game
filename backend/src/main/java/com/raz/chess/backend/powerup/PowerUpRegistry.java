package com.raz.chess.backend.powerup;

import java.util.Map;

import org.springframework.stereotype.Component;

@Component
public class PowerUpRegistry {
	private final Map<String, PowerUp> powerUps;
	
	public PowerUpRegistry() {
		powerUps = Map.of(
			"Extra Move", new ExtraMove(),
			"Freeze Piece", new FreezePiece()
		);
	}
	
	public PowerUp get(String name) {
		return powerUps.get(name);
	}
}

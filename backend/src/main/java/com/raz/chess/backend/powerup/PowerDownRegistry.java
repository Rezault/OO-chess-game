package com.raz.chess.backend.powerup;

import java.util.Map;

import org.springframework.stereotype.Component;

@Component
public class PowerDownRegistry {
	private final Map<String, PowerDown> powerDowns;
	
	public PowerDownRegistry() {
		powerDowns = Map.of(
			"Disintegration", new Disintegration(),
			"Betrayal", new Betrayal()
		);
	}
	
	public PowerDown get(String name) {
		return powerDowns.get(name);
	}
}

package com.raz.chess.backend.controller;

import java.time.Instant;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.raz.chess.backend.game.GameService;
import com.raz.chess.backend.game.GameState;
import com.raz.chess.backend.game.Move;
import com.raz.chess.backend.powerup.PowerUpMessage;

@Controller
public class GameController {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    public GameController(GameService gameService, SimpMessagingTemplate template) {
        this.gameService = gameService;
        this.messagingTemplate = template;
    }

    @MessageMapping("/move") // /app/move
    public void handleMove(Move move) {
    	System.out.println("MAKING MOVE " + Instant.now().toEpochMilli());
    	System.out.println(move);
    	System.out.println(gameService);
        GameState updated = gameService.applyMove(move);
        System.out.println(updated);
        if (updated != null) {
            // broadcast new game state to everyone
            messagingTemplate.convertAndSend("/topic/game", updated);
        }
        // else: illegal move, do nothing. perhaps send a warning?
    }
    
    @MessageMapping("/use-powerup")
    public void applyPowerUp(PowerUpMessage message) {
    	GameState updated = gameService.usePowerUp(message);
    	if (updated != null) {
    		// broadcast new game state to everyone
    		messagingTemplate.convertAndSend("/topic/game", updated);
    	}
    }
}

package com.raz.chess.backend.controller;

import java.time.Instant;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.raz.chess.backend.game.GameService;
import com.raz.chess.backend.game.GameState;
import com.raz.chess.backend.game.Move;
import com.raz.chess.backend.lobby.LobbyService;
import com.raz.chess.backend.powerup.PowerUpMessage;

@Controller
public class GameController {

    private final GameService gameService;
    private final LobbyService lobbyService;
    private final SimpMessagingTemplate messagingTemplate;

    public GameController(GameService gameService, LobbyService lobbyService, SimpMessagingTemplate template) {
        this.gameService = gameService;
        this.lobbyService = lobbyService;
        this.messagingTemplate = template;
    }

    @MessageMapping("/move") // /app/move
    public void handleMove(Move move, SimpMessageHeaderAccessor headerAccessor) {
    	String sessionId = headerAccessor.getSessionId();
    	
    	String playerName = lobbyService.getNameForSession(sessionId);
        if (playerName == null) {
            System.out.println("Unknown session tried to move: " + sessionId);
            return;
        }
    	
    	System.out.println("MAKING MOVE " + Instant.now().toEpochMilli());

        GameState updated = gameService.applyMove(move, playerName);
        System.out.println(updated);
        if (updated != null) {
            // broadcast new game state to everyone
            messagingTemplate.convertAndSend("/topic/game", updated);
        }
        // else: illegal move, do nothing. perhaps send a warning?
    }
    
    @MessageMapping("/use-powerup")
    public void applyPowerUp(PowerUpMessage message, SimpMessageHeaderAccessor headerAccessor) {
    	String sessionId = headerAccessor.getSessionId();
        String playerName = lobbyService.getNameForSession(sessionId);
        if (playerName == null) return;
        
    	GameState updated = gameService.usePowerUp(message, playerName);
    	if (updated != null) {
    		// broadcast new game state to everyone
    		messagingTemplate.convertAndSend("/topic/game", updated);
    	}
    }
}

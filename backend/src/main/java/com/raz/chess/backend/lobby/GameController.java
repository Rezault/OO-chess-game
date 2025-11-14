package com.raz.chess.backend.lobby;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

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
        GameState updated = gameService.applyMove(move);
        if (updated != null) {
            // broadcast new game state to everyone
            messagingTemplate.convertAndSend("/topic/game", updated);
        }
        // else: illegal move, do nothing. perhaps send a warning?
    }
}

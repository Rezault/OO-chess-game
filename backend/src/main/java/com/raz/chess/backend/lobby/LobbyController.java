package com.raz.chess.backend.lobby;

import java.time.Instant;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class LobbyController {
	private final LobbyService lobbyService;
	private final GameService gameService;
	private final SimpMessagingTemplate messagingTemplate;
	
	public LobbyController(LobbyService lobbyService, GameService gameService, SimpMessagingTemplate template) {
		this.lobbyService = lobbyService;
		this.gameService = gameService;
		this.messagingTemplate = template;
	}
	
	@MessageMapping("/join") // client sends to /app/join
	@SendTo("/topic/lobby") // broadcast to /topic/lobby
	public LobbyState handleJoin(JoinMessage join, SimpMessageHeaderAccessor headerAccessor) {
		String sessionId = headerAccessor.getSessionId();
		LobbyState state = lobbyService.join(join.getName(), sessionId);
		
		// send system message
		ChatMessage sys = new ChatMessage(
				ChatMessage.Type.SYSTEM, 
				"SYSTEM", 
				join.getName() + " joined the lobby", 
				Instant.now().toString()
		);
		
		System.out.println("Player joined: " + join.getName() + "(session id: " + sessionId + ")");
		messagingTemplate.convertAndSend("/topic/chat", sys);
		
		// check if we need to wait for another player
		if (state.getPlayer1() != null && state.getPlayer2() != null) {
			ChatMessage m = new ChatMessage(
				ChatMessage.Type.SYSTEM, 
				"SYSTEM", 
				"Both players joined, game commencing", 
				Instant.now().toString()
			);
			messagingTemplate.convertAndSend("/topic/chat", m);
			
			// start game
			GameState game = gameService.startGame(state);
			messagingTemplate.convertAndSend("/topic/game", game);
		} else if (state.getPlayer1() != null || state.getPlayer2() != null) {
			ChatMessage m = new ChatMessage(
				ChatMessage.Type.SYSTEM, 
				"SYSTEM", 
				"Waiting for second player", 
				Instant.now().toString()
			);
			messagingTemplate.convertAndSend("/topic/chat", m);
		}
		
		return state;
	}
	
	@MessageMapping("/chat")
	@SendTo("/topic/chat")
	public ChatMessage handleChat(ChatMessage incoming) {
		ChatMessage msg = new ChatMessage();
		msg.setType(ChatMessage.Type.CHAT);
		msg.setSender(incoming.getSender());
		msg.setContent(incoming.getContent());
		msg.setTimestamp(Instant.now().toString());
		
		return msg;
	}
}

package com.raz.chess.backend.lobby;

import java.time.Instant;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {
	private final LobbyService lobbyService;
	private final SimpMessagingTemplate messagingTemplate;
	
    public WebSocketEventListener(LobbyService lobbyService, SimpMessagingTemplate template) {
        this.lobbyService = lobbyService;
        this.messagingTemplate = template;
    }
    
    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();
        String name = lobbyService.getNameForSession(sessionId);
        
        System.out.println("Client disconnected: " + sessionId);

        // broadcast updated lobby to all clients
        LobbyState updated = lobbyService.disconnect(sessionId);
        messagingTemplate.convertAndSend("/topic/lobby", updated);
        
        // alert clients that player left
        if (name != null) {
            ChatMessage sys = new ChatMessage(
                    ChatMessage.Type.SYSTEM,
                    "SYSTEM",
                    name + " left the lobby, game paused",
                    Instant.now().toString()
            );
            messagingTemplate.convertAndSend("/topic/chat", sys);
        }
    }
}

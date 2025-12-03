package com.raz.chess.backend.lobby;

import org.springframework.stereotype.Service;

@Service
public class LobbyService {
	
	// keep track of players and their sessions
	// terminate session when player disconnects
    private String player1;
    private String player1Session;
    private String player2;
    private String player2Session;

    public synchronized LobbyState join(String name, String sessionId) {
    	// ensure unique name
        String assignedName = makeUniqueName(name);
        
        if (player1 == null) {
            player1 = assignedName;
            player1Session = sessionId;
        } else if (player2 == null) {
            player2 = assignedName;
            player2Session = sessionId;
        } else {
            // lobby full – for now we just keep the existing two
        	// maybe spectators?
        }
        
        return getState();
    }
    
    public synchronized LobbyState disconnect(String sessionId) {
    	if (sessionId.equals(player1Session)) {
    		player1 = null;
    		player1Session = null;
    	} else if (sessionId.equals(player2Session)) {
    		player2 = null;
    		player2Session = null;
    	}
    	
    	return getState();
    }
    
    public synchronized String getNameForSession(String sessionId) {
        if (sessionId != null && sessionId.equals(player1Session)) {
            return player1;
        }
        if (sessionId != null && sessionId.equals(player2Session)) {
            return player2;
        }
        return null;
    }

    public synchronized LobbyState getState() {
        return new LobbyState(player1, player2);
    }
    
    // make a unique name if names clash
    private String makeUniqueName(String base) {
        // if no clash, use as-is
        if (!base.equals(player1) && !base.equals(player2)) {
            return base;
        }

        int suffix = 2;
        while (true) {
            String candidate = base + suffix;
            if (!candidate.equals(player1) && !candidate.equals(player2)) {
                return candidate;
            }
            suffix++;
        }
    }
}

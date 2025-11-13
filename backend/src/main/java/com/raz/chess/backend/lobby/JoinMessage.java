package com.raz.chess.backend.lobby;

public class JoinMessage {
    private String name;

    public JoinMessage() {
    }

    public JoinMessage(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}

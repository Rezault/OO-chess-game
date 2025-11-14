package com.raz.chess.backend.lobby;

public class GameState {
	public enum Status {
		WAITING_FOR_PLAYERS,
		IN_PROGRESS,
		FINISHED
	}
	
	private String whitePlayer;
	private String blackPlayer;
	private Status status;
	private String turn;
	
	public GameState() {}
	public GameState(String whitePlayer, String blackPlayer, Status status, String turn) {
		this.whitePlayer = whitePlayer;
	    this.blackPlayer = blackPlayer;
	    this.status = status;
	    this.turn = turn;
	}
	
	public String getWhitePlayer() { return whitePlayer; }
    public void setWhitePlayer(String whitePlayer) { this.whitePlayer = whitePlayer; }

    public String getBlackPlayer() { return blackPlayer; }
    public void setBlackPlayer(String blackPlayer) { this.blackPlayer = blackPlayer; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getTurn() { return turn; }
    public void setTurn(String turn) { this.turn = turn; }
}

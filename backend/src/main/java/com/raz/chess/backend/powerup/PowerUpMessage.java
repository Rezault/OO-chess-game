package com.raz.chess.backend.powerup;

public class PowerUpMessage {
	private String playerName;
	private int row;
	private int col;
	
	public String getPlayerName() {
		return playerName;
	}
	
	public void setPlayerName(String name) {
		this.playerName = name;
	}
	
	public int getRow() {
		return row;
	}
	
	public void setRow(int row) {
		this.row = row;
	}
	
	public int getCol() {
		return col;
	}
	
	public void setCol(int col) {
		this.col = col;
	}
}

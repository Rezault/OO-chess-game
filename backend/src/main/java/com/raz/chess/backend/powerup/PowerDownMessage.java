package com.raz.chess.backend.powerup;

public class PowerDownMessage {
	private char colour;
	private int fromRow;
	private int fromCol;
	private int toRow;
	private int toCol;
	
	public char getColour() {
		return colour;
	}
	
	public void setColour(char c) {
		this.colour = c;
	}
	
	public int getFromRow() {
		return fromRow;
	}
	
	public void setFromRow(int row) {
		this.fromRow = row;
	}
	
	public int getFromCol() {
		return fromCol;
	}
	
	public void setFromCol(int col) {
		this.fromCol = col;
	}
	
	public int getToRow() {
		return toRow;
	}
	
	public void setToRow(int row) {
		this.toRow = row;
	}
	
	public int getToCol() {
		return toCol;
	}
	
	public void setToCol(int col) {
		this.toCol = col;
	}
}

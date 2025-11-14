package com.raz.chess.backend.lobby;

public class Move {
	private int fromRow;
	private int fromCol;
	private int toRow;
	private int toCol;
	private String player;
	
	public Move() {}
	
	public Move(int fromRow, int fromCol, int toRow, int toCol, String player) {
		this.fromRow = fromRow;
		this.fromCol = fromCol;
	    this.toRow = toRow;
	    this.toCol = toCol;
	    this.player = player;
	}
	
	public int getFromRow() { return fromRow; }
    public void setFromRow(int fromRow) { this.fromRow = fromRow; }

    public int getFromCol() { return fromCol; }
    public void setFromCol(int fromCol) { this.fromCol = fromCol; }

    public int getToRow() { return toRow; }
    public void setToRow(int toRow) { this.toRow = toRow; }

    public int getToCol() { return toCol; }
    public void setToCol(int toCol) { this.toCol = toCol; }

    public String getPlayer() { return player; }
    public void setPlayer(String player) { this.player = player; }
}

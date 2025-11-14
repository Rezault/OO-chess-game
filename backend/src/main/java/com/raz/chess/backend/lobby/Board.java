package com.raz.chess.backend.lobby;

public class Board {
	private final String[][] grid = new String[8][8];
	
	public Board() {
		initialise();
	}
	
	public String[][] getGrid() {
		return grid;
	}
	
	public String get(int row, int col) {
		return grid[row][col];
	}
	
	public void set(int row, int col, String piece) {
		grid[row][col] = piece;
	}
	
	public void move(int fromRow, int fromCol, int toRow, int toCol) {
		String piece = grid[fromRow][fromCol];
		grid[fromRow][fromCol] = null;
		grid[toRow][toCol] = piece;
	}
	
	private void initialise() {
		// black pieces
		grid[0][0] = "br"; grid[0][1] = "bn"; grid[0][2] = "bb"; grid[0][3] = "bq";
		grid[0][4] = "bk"; grid[0][5] = "bb"; grid[0][6] = "bn"; grid[0][7] = "br";
		
		for (int col = 0; col < 8; col++) {
			grid[1][col] = "bp";
		}
		
		// empty squares
	    for (int row = 2; row < 6; row++) {
	        for (int col = 0; col < 8; col++) {
	            grid[row][col] = null;
	        }
	    }

	    // white pieces
	    for (int col = 0; col < 8; col++) {
	        grid[6][col] = "wp";
	    }

	    grid[7][0] = "wr"; grid[7][1] = "wn"; grid[7][2] = "wb"; grid[7][3] = "wq";
	    grid[7][4] = "wk"; grid[7][5] = "wb"; grid[7][6] = "wn"; grid[7][7] = "wr";
	}
}

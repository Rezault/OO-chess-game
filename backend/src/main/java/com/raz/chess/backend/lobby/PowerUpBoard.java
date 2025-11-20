package com.raz.chess.backend.lobby;

public class PowerUpBoard {
	private final String[][] grid = new String[8][8];
	
	public PowerUpBoard() {
		initialise();
	}
	
	public String get(int row, int col) {
		return grid[row][col];
	}
	
	public void spawnRandomBox(Board board) {
		int randRow = (int)(Math.random() * 8);
		int randCol = (int)(Math.random() * 8);
		
		while (board.get(randRow, randCol) != null) {
			randRow = (int)(Math.random() * 8);
			randCol = (int)(Math.random() * 8);
		}
		
		grid[randRow][randCol] = "box";
	}
	
	private void initialise() {
		for (int row = 0; row < 8; row++) {
	        for (int col = 0; col < 8; col++) {
	            grid[row][col] = null;
	        }
	    }
	}
}

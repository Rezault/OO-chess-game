package com.raz.chess.backend.powerup;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import com.raz.chess.backend.game.Board;
import com.raz.chess.backend.game.GameState;


public class EvolvePiece implements PowerUp {
	@Override
	public String name() {
		return "Evolve Piece";
	}
	
	@Override
	public boolean activate(GameState game, PowerUpMessage message, char colour) {
		Board board = game.getBoard();
		if (board == null) return false;
		
		// get all player's pieces
		List<int[]> positions = new ArrayList<>();

	    for (int row = 0; row < 8; row++) {
	        for (int col = 0; col < 8; col++) {
	            String piece = board.get(row, col);
	            if (piece != null && piece.charAt(0) == colour && piece.charAt(1) != 'k' && piece.charAt(1) != 'q') {
	                positions.add(new int[]{row, col});
	            }
	        }
	    }

	    if (positions.isEmpty()) return false;
	    
	    // choose a random piece to evolve
	    int[] randPiece = positions.get(new Random().nextInt(positions.size()));
	    if (randPiece == null) return false;
	    
	    int row = randPiece[0];
	    int col = randPiece[1];
	    
	    // set evolved row and col
	    if (colour == 'w') {
	    	game.setWhiteEvolvedPieceRow(row);
	    	game.setWhiteEvolvedPieceCol(col);
	    } else {
	    	game.setBlackEvolvedPieceRow(row);
	    	game.setBlackEvolvedPieceCol(col);
	    }
		
		return true;
	}
}

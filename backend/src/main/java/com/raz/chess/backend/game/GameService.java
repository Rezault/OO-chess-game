package com.raz.chess.backend.game;

import java.time.Instant;
import java.util.Random;
import java.util.UUID;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.raz.chess.backend.chat.ChatMessage;
import com.raz.chess.backend.chat.ChatMessage.Type;
import com.raz.chess.backend.lobby.LobbyState;
import com.raz.chess.backend.powerup.PowerDown;
import com.raz.chess.backend.powerup.PowerDownMessage;
import com.raz.chess.backend.powerup.PowerDownRegistry;
import com.raz.chess.backend.powerup.PowerUp;
import com.raz.chess.backend.powerup.PowerUpMessage;
import com.raz.chess.backend.powerup.PowerUpRegistry;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class GameService {
	private GameState currentGame;
	private final SimpMessagingTemplate messagingTemplate;
	private static final Logger log = LoggerFactory.getLogger(GameService.class);
	private final Random random = new Random();
	
	 /**
     * Used to confirm whether multiple GameService instances are being created at
     * runtime. In normal operation Spring should keep this bean as a singleton.
     */
    private final String instanceId = UUID.randomUUID().toString();
	
	// for powerups
	private final PowerUpRegistry powerUpRegistry;
	private final PowerDownRegistry powerDownRegistry;
	
	public GameService(SimpMessagingTemplate messagingTemplate, PowerUpRegistry powerUpRegistry, PowerDownRegistry powerDownRegistry) {
		log.info("GameService instance created: {}", instanceId);
        this.messagingTemplate = messagingTemplate;
        this.powerUpRegistry = powerUpRegistry;
        this.powerDownRegistry = powerDownRegistry;
    }
	
	public synchronized GameState startGame(LobbyState lobby) {
		String white = lobby.getPlayer1();
		String black = lobby.getPlayer2();
		
		currentGame = new GameState(white, black, GameState.Status.IN_PROGRESS, "WHITE", new Board());
		log.info("Starting game for players: white='{}', black='{}' (instance {})", white, black, instanceId);
		
		resetMysteryBoxTime();
		
		return currentGame;
	}
	
	public synchronized GameState getCurrentGame() {
		return currentGame;
	}
	
	public synchronized GameState applyMove(Move move, String playerName) {
		log.info(
		        "applyMove called. instance={}, currentGame={}, status={}, move={}",
		        instanceId,
		        (currentGame == null ? "null" : "exists"),
		        (currentGame == null ? "N/A" : currentGame.getStatus()),
		        move
		    );
		
		// check that we have a game and it is in progress
        if (currentGame == null) {
                log.warn("applyMove received with no active game. Instance: {}, move: {}", instanceId, move);
                return null;
        }
        if (currentGame.getStatus() != GameState.Status.IN_PROGRESS) {
                log.warn("applyMove received while game not in progress (status: {}, instance: {})", currentGame.getStatus(), instanceId);
                return null;
        }
		
		System.out.println("Applying a move");
		
		// check if it's the right player's turn
		String expectedPlayer = currentGame.getTurn().equals("WHITE") ? currentGame.getWhitePlayer() : currentGame.getBlackPlayer();
		if (!expectedPlayer.equals(playerName)) {
			log.warn("Wrong player trying to move. Expected={}, got={}, turn={}",
		             expectedPlayer, playerName, currentGame.getTurn());
			return null;
		}
		
		System.out.println("Right player's move");
		
		Board board = currentGame.getBoard();
		int fromRow = move.getFromRow();
		int fromCol = move.getFromCol();
		int toRow = move.getToRow();
		int toCol = move.getToCol();
		
		// check the piece at the square
		String piece = board.get(fromRow, fromCol);
		if (piece == null) return null;
		
		System.out.println("Piece found");
		
		char colour = piece.charAt(0);
		char type = piece.charAt(1);
		
		// check that the piece isn't frozen
		int frozenRow;
		int frozenCol;
		if (colour == 'w') {
			frozenRow = currentGame.getWhiteFrozenPieceRow();
			frozenCol = currentGame.getWhiteFrozenPieceCol();
		} else {
			frozenRow = currentGame.getBlackFrozenPieceRow();
			frozenCol = currentGame.getBlackFrozenPieceCol();
		}
		if (frozenRow == fromRow && frozenCol == fromCol) return null;
		
		
		// move validation. get the current colour to move and apply the new move if legal
		char colourToMove = currentGame.getTurn().equals("WHITE") ? 'w' : 'b';
		Board newBoard = GameRules.applyMoveIfLegal(currentGame, fromRow, fromCol, toRow, toCol, colourToMove);
		
		if (newBoard == null) {
			return null;  // illegal move
		}
		
		System.out.println("Legal move");
		
		// handle pawn promotion if applicable
        if (type == 'p') {
        	boolean reachedEnd = (colour == 'w' && toRow == 0) || (colour == 'b' && toRow == 7);
            if (reachedEnd) {
            	String promotion = validatePromotion(move.getPromotion());
            	
            	// in the client we're using motion/react for animations, and each piece needs a unique id
            	// e.g. if the e pawn (5th pawn) promotes, then we'll just do
            	// wqp5 (white queen pawn 5) so that we wont have conflicting ids between promotions and existing pieces
                newBoard.set(toRow, toCol, "" + colour + promotion + type + piece.charAt(2));
            }
        }
        
        // update en passant square
        currentGame.setEnPassantRow(-1);
        currentGame.setEnPassantCol(-1);
        if (type == 'p' && Math.abs(fromRow - toRow) == 2) {
        	int dir = (colour == 'w') ? -1 : 1;
        	currentGame.setEnPassantRow(fromRow + dir);
        	currentGame.setEnPassantCol(fromCol);
        }
		
		// check if it was a king or rook move
		boolean isKingMove = (type == 'k');
		boolean isRookMove = (type == 'r');
		
		// check if it was castle; row remains the same, column changes by 2
		// can be either queen or king side castling, depends what column we move to
		if (isKingMove && fromRow == toRow && Math.abs(fromCol - toCol) == 2) {
			if (toCol == 6) {
				// king side
				newBoard.move(fromRow, 7, fromRow, 5);
			} else if (toCol == 2) {
				// queen side
				newBoard.move(fromRow, 0, fromRow, 3);
			}
			
			// update castling rights
			if (colour == 'w') {
				currentGame.setWhiteKingSideCastle(false);
				currentGame.setWhiteQueenSideCastle(false);
			} else {
				currentGame.setBlackKingSideCastle(false);
				currentGame.setBlackQueenSideCastle(false);
			}
		} else if (isKingMove) {
			// normal king move, turn off castling
			if (colour == 'w') {
				currentGame.setWhiteKingSideCastle(false);
				currentGame.setWhiteQueenSideCastle(false);
			} else {
				currentGame.setBlackKingSideCastle(false);
				currentGame.setBlackQueenSideCastle(false);
			}
		} else if (isRookMove) {
			// rook moved, depending which one we must update castling rights
			if (colour == 'w') {
				if (fromRow == 7 && fromCol == 7) currentGame.setWhiteKingSideCastle(false);
				if (fromRow == 7 && fromCol == 0) currentGame.setWhiteQueenSideCastle(false);
			} else {
				if (fromRow == 0 && fromCol == 7) currentGame.setBlackKingSideCastle(false);
				if (fromRow == 0 && fromCol == 0) currentGame.setBlackQueenSideCastle(false);
			}
		}
		
		// check if the piece passes through a mystery box. if it does, award the player
		int mysteryBoxRow = currentGame.getMysteryBoxRow();
		int mysteryBoxCol = currentGame.getMysteryBoxCol();
		boolean powerDown = false; // track if we were given a power down
		if (passedThroughMysteryBox(fromRow, fromCol, toRow, toCol, mysteryBoxRow, mysteryBoxCol)) {
			currentGame.setMysteryBoxRow(-1);
			currentGame.setMysteryBoxCol(-1);
			
			resetMysteryBoxTime();
			
			// decide between powerup/down
			// 10% chance for powerdown
			boolean isPowerDown = random.nextInt(10) == 0; 
			if (isPowerDown) {
				// powerdown
				powerDown = true;
				String[] powerDowns = { "Betrayal", "Disintegration" };
				String pdown = powerDowns[random.nextInt(powerDowns.length)];
				
				PowerDownMessage msg = new PowerDownMessage();
				msg.setColour(colour);
				msg.setFromRow(fromRow);
				msg.setFromCol(fromCol);
				msg.setToRow(toRow);
				msg.setToCol(toCol);
				
				usePowerDown(pdown, msg, newBoard);
			} else {
				// powerup. give a random one to the player
				// use very simple system right now. in future, if more powerups, definitely use an enum to scale
				
				double roll = random.nextDouble(); // 0.0 - 1.0

				String result;
				if (roll < 0.50) {
				    result = "Freeze Piece";            // 50%
				} else if (roll < 0.80) {
				    result = "Extra Move";        // next 30%
				} else {
				    result = "Evolve Piece";            // remaining 20%
				}
				
				if (colour == 'w') {
					currentGame.setWhitePlayerPowerUp(result);
				} else {
					currentGame.setBlackPlayerPowerUp(result);
				}
			}

		}
		
		// check if we need to spawn mystery box
		int movesUntilMysteryBox = currentGame.getMovesUntilMysteryBox();
		if (movesUntilMysteryBox <= 0 && mysteryBoxRow == -1 && mysteryBoxCol == -1) {
			spawnMysteryBox(newBoard);
		}
		
		// decrease counter by 1
		currentGame.setMovesUntilMysteryBox(movesUntilMysteryBox - 1);
		
		// check if we moved/captured an evolved piece. if it was, reset evolved
		int rW = currentGame.getWhiteEvolvedPieceRow();
		int cW = currentGame.getWhiteEvolvedPieceCol();
		int rB = currentGame.getBlackEvolvedPieceRow();
		int cB = currentGame.getBlackEvolvedPieceCol();
		if (colour == 'w') {
			if (rW == fromRow && cW == fromCol) {
				currentGame.setWhiteEvolvedPieceRow(-1);
				currentGame.setWhiteEvolvedPieceCol(-1);
			}
			if (rB == toRow && cB == toCol) {
				currentGame.setBlackEvolvedPieceRow(-1);
				currentGame.setBlackEvolvedPieceCol(-1);
			}
		} else {
			if (rB == fromRow && cB == fromCol) {
				currentGame.setBlackEvolvedPieceRow(-1);
				currentGame.setBlackEvolvedPieceCol(-1);
			}
			if (rW == toRow && cW == toCol) {
				currentGame.setWhiteEvolvedPieceRow(-1);
				currentGame.setWhiteEvolvedPieceCol(-1);
			}
		}
		
		// if we werent given a powerdown, check if an evolved piece moved
		if (powerDown == false) {
			// set last move information for client effects (if it's an evolved piece)
			if ((rW == fromRow && cW == fromCol) || (rB == fromRow && cB == fromCol)) {
				String effectType = type == 'n' ? "KNIGHT_AOE" : type == 'r' ? "ROOK_BLAST" : type == 'b' ? "BISHOP_SNIPER" : "";
				currentGame.setLastEffectType(effectType);
				currentGame.setLastEffectRow(toRow);
				currentGame.setLastEffectCol(toCol);
				currentGame.setLastEffectSourceRow(fromRow);
				currentGame.setLastEffectSourceCol(fromCol);
				currentGame.setLastEffectId(currentGame.getLastEffectId() + 1);
			} else {
				currentGame.setLastEffectType("");
			}
		}
		
		// set the board of the current game to the new board
		currentGame.setBoard(newBoard);
		
		// check if player has an extra move
		boolean extraMove = colour == 'w' ? currentGame.getWhiteExtraMove() : currentGame.getBlackExtraMove();
		if (!extraMove) {
			// change turn
			boolean isWhite = currentGame.getTurn().equals("WHITE");
			currentGame.setTurn(isWhite ? "BLACK" : "WHITE");
			
			// get rid of any frozen pieces
			if (isWhite) {
				// white's turn just ended
				currentGame.setWhiteFrozenPieceRow(-1);
				currentGame.setWhiteFrozenPieceCol(-1);
			} else {
				// black's turn just ended
				currentGame.setBlackFrozenPieceRow(-1);
				currentGame.setBlackFrozenPieceCol(-1);
			}
			
		} else {
			// disable extra move flag
			if(colour == 'w') { currentGame.setWhiteExtraMove(false); } else { currentGame.setBlackExtraMove(false); }
		}
		
		// update game status
		char nextColor = currentGame.getTurn().equals("WHITE") ? 'w' : 'b';
        GameState.Status status = GameRules.evaluateStatus(currentGame, nextColor);
        currentGame.setStatus(status);
		
		return currentGame;
	}
	
	 private String validatePromotion(String promotion) {
         if (promotion == null || promotion.isBlank()) {
                 return "q";
         }

         char type = Character.toLowerCase(promotion.charAt(0));
         if (type == 'q' || type == 'r' || type == 'b' || type == 'n') {
                 return String.valueOf(type);
         }

         return "q";
	 }
	 
	 private void resetMysteryBoxTime() {
		// reset counter for mystery box spawn
		int low = 3;
		int high = 8;		
		int result = random.nextInt(high-low) + low;
		currentGame.setMovesUntilMysteryBox(result);
	 }
	 
	 private void spawnMysteryBox(Board board) {
		// get random square and spawn the box
		int randRow = (int)(Math.random() * 8);
		int randCol = (int)(Math.random() * 8);
					
		while (board.get(randRow, randCol) != null) {
			randRow = (int)(Math.random() * 8);
			randCol = (int)(Math.random() * 8);
		}
					
		currentGame.setMysteryBoxRow(randRow);
		currentGame.setMysteryBoxCol(randCol);
		
		/*ChatMessage m = new ChatMessage(
			ChatMessage.Type.SYSTEM,
			"SYSTEM",
		    "A mystery box has spawned!",
		    Instant.now().toString()
		);

		messagingTemplate.convertAndSend("/topic/chat", m);*/
	 }
	 
	 private boolean passedThroughMysteryBox(int fromRow, int fromCol, int toRow, int toCol, int boxRow, int boxCol) {
		if (boxRow < 0 || boxCol < 0) return false;
		
		// If the box is exactly on the starting or ending square, it's collected.
	    if ((fromRow == boxRow && fromCol == boxCol) ||
	        (toRow == boxRow && toCol == boxCol)) {
	        return true;
	    }
	    
	    int rowDiff = toRow - fromRow;
	    int colDiff = toCol - fromCol;

	    // Only sliding moves (rook/bishop/queen) can pass THROUGH squares.
	    // Rook: same row or same column.
	    // Bishop: diagonal (abs diff equal).
	    if (!(rowDiff == 0 || colDiff == 0 || Math.abs(rowDiff) == Math.abs(colDiff))) {
	        return false;
	    }
		
		// direction of movement in row/col
	    int dRow = Integer.compare(toRow, fromRow); // -1, 0, or 1
	    int dCol = Integer.compare(toCol, fromCol); // -1, 0, or 1

	    int r = fromRow;
	    int c = fromCol;
	    
	    while (r != toRow || c != toCol) {
	        if (r == boxRow && c == boxCol) {
	            return true;
	        }
	        r += dRow;
	        c += dCol;

	        // board is 8x8, so at most 7 steps; if something goes wrong, bail.
	        if (r < 0 || r > 7 || c < 0 || c > 7) {
	            break;
	        }
	    }

	    return false;
	 }
	 
	 // enable power up
	 public synchronized GameState usePowerUp(PowerUpMessage message, String playerName) {
		 if (currentGame == null) return null;
		 if (playerName == null) return null;
		 
		 // change the client-sent name to the one found by the server. just incase.
		 message.setPlayerName(playerName);
		 
		 char colour = playerName.equals(currentGame.getWhitePlayer()) ? 'w' : 'b';
		 char currTurn = currentGame.getTurn().equals("WHITE") ? 'w' : 'b';
		 
		 // check that it's the current player's turn
		 if (currTurn != colour) return currentGame; // not the player's turn
		 
		 // get the current power up for the player
		 String playerPowerUp = colour == 'w' ? currentGame.getWhitePlayerPowerUp() : currentGame.getBlackPlayerPowerUp();
		 if (playerPowerUp == null) return currentGame; // no powerup
		 
		 // get the actual power up from the registry
		 log.info("Finding " + playerPowerUp + " in registry");
		 PowerUp powerUp = powerUpRegistry.get(playerPowerUp);
		 if (powerUp == null) return currentGame; // couldn't find power up
		 
		 // activate and clear power up
		 System.out.println("Found, Activating power up");
		 boolean activated = powerUp.activate(currentGame, message, colour);
		 if (activated) {
			 // successfully activated, time to reset the power up for the player
			 if (colour == 'w') {
				 currentGame.setWhitePlayerPowerUp(null);
			 } else {
				 currentGame.setBlackPlayerPowerUp(null);
			 }
			 
			 // send system message that player used a power up
			 ChatMessage m = new ChatMessage(
		         ChatMessage.Type.SYSTEM,
			     "SYSTEM",
			     playerName + " used power-up: " + powerUp.name(),
			     Instant.now().toString()
			 );
			 
			 // broadcast that player used powerup
			 messagingTemplate.convertAndSend("/topic/powerUpUsed", powerUp.name());
		 }
		 
		 return currentGame;
	 }
	 
	 // enable power down
	 public synchronized GameState usePowerDown(String powerDownName, PowerDownMessage message, Board board) {
		 if (currentGame == null) return null;

		 char colour = message.getColour();
		 
		 // get the actual power up from the registry
		 log.info("Finding " + powerDownName + " in registry");
		 PowerDown powerDown = powerDownRegistry.get(powerDownName);
		 if (powerDown == null) return currentGame; // couldn't find power down
		 
		 // activate and clear power up
		 System.out.println("Found, Activating power down");
		 powerDown.activate(currentGame, message, board);
		 
		 String playerName;
		 if (colour == 'w') {
			 playerName = currentGame.getWhitePlayer();
		 } else {
			 playerName = currentGame.getBlackPlayer();
		 }
		 
		 // send system message that player got a power down
		 ChatMessage m = new ChatMessage(
	         ChatMessage.Type.SYSTEM,
		     "SYSTEM",
		     "Unlucky, " + playerName + "! " + powerDownName,
		     Instant.now().toString()
		 );
		 
		 // broadcast that player got power down
		 messagingTemplate.convertAndSend("/topic/powerUpUsed", powerDownName);
		 
		 return currentGame;
	 }
}

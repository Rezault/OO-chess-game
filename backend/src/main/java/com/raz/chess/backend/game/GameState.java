package com.raz.chess.backend.game;

public class GameState {
	public enum Status {
		WAITING_FOR_PLAYERS, IN_PROGRESS, FINISHED, CHECKMATE, STALEMATE
	}

	private String whitePlayer;
	private String blackPlayer;
	private Status status;
	private String turn;
	private Board board;

	// castling
	private boolean canCastleKingSideWhite = true;
	private boolean canCastleQueenSideWhite = true;
	private boolean canCastleKingSideBlack = true;
	private boolean canCastleQueenSideBlack = true;

	// en passant (-1, -1 when none)
	private int enPassantRow = -1;
	private int enPassantCol = -1;

	// powerup (-1, -1 when none)
	private int movesUntilMysteryBox;
	private int mysteryBoxRow = -1;
	private int mysteryBoxCol = -1;
	private String whitePlayerPowerUp = null;
	private String blackPlayerPowerUp = null;
	
	// extra move power up
	private boolean whiteExtraMove = false;
	private boolean blackExtraMove = false;
	
	// frozen pieces
	private int whiteFrozenPieceRow = -1;
	private int whiteFrozenPieceCol = -1;
	private int blackFrozenPieceRow = -1;
	private int blackFrozenPieceCol = -1;
	
	// evolved pieces
	private int whiteEvolvedPieceRow = -1;
	private int whiteEvolvedPieceCol = -1;
	private int blackEvolvedPieceRow = -1;
	private int blackEvolvedPieceCol = -1;
	
	// for client animation: pass back the last used power up info
	private String lastEffectType; // "KNIGHT_AOE", "BISHOP_SNIPER", "ROOK_BLAST"
	private int lastEffectRow; // target row
	private int lastEffectCol; // target col
	private int lastEffectSourceRow; // the row the piece was on originally
	private int lastEffectSourceCol; // the column the piece was on originally
	private int lastEffectId; // incrementing id so clients know it's new

	public GameState() {
	}

	public GameState(String whitePlayer, String blackPlayer, Status status, String turn, Board board) {
		this.whitePlayer = whitePlayer;
		this.blackPlayer = blackPlayer;
		this.status = status;
		this.turn = turn;
		this.board = board;
	}

	public String getWhitePlayer() {
		return whitePlayer;
	}

	public void setWhitePlayer(String whitePlayer) {
		this.whitePlayer = whitePlayer;
	}

	public String getBlackPlayer() {
		return blackPlayer;
	}

	public void setBlackPlayer(String blackPlayer) {
		this.blackPlayer = blackPlayer;
	}

	public Status getStatus() {
		return status;
	}

	public void setStatus(Status status) {
		this.status = status;
	}

	public String getTurn() {
		return turn;
	}

	public void setTurn(String turn) {
		this.turn = turn;
	}

	public Board getBoard() {
		return board;
	}

	public void setBoard(Board board) {
		this.board = board;
	}

	public boolean isWhiteKingSideCastle() {
		return canCastleKingSideWhite;
	}

	public void setWhiteKingSideCastle(boolean v) {
		this.canCastleKingSideWhite = v;
	}

	public boolean isWhiteQueenSideCastle() {
		return canCastleQueenSideWhite;
	}

	public void setWhiteQueenSideCastle(boolean v) {
		this.canCastleQueenSideWhite = v;
	}

	public boolean isBlackKingSideCastle() {
		return canCastleKingSideBlack;
	}

	public void setBlackKingSideCastle(boolean v) {
		this.canCastleKingSideBlack = v;
	}

	public boolean isBlackQueenSideCastle() {
		return canCastleQueenSideBlack;
	}

	public void setBlackQueenSideCastle(boolean v) {
		this.canCastleQueenSideBlack = v;
	}

	public int getEnPassantRow() {
		return enPassantRow;
	}

	public void setEnPassantRow(int enPassantRow) {
		this.enPassantRow = enPassantRow;
	}

	public int getEnPassantCol() {
		return enPassantCol;
	}

	public void setEnPassantCol(int enPassantCol) {
		this.enPassantCol = enPassantCol;
	}
	
	public int getMovesUntilMysteryBox() {
		return movesUntilMysteryBox;
	}
	
	public void setMovesUntilMysteryBox(int m) {
		this.movesUntilMysteryBox = m;
	}

	public int getMysteryBoxRow() {
		return mysteryBoxRow;
	}

	public void setMysteryBoxRow(int row) {
		this.mysteryBoxRow = row;
	}

	public int getMysteryBoxCol() {
		return mysteryBoxCol;
	}

	public void setMysteryBoxCol(int col) {
		this.mysteryBoxCol = col;
	}

	public String getWhitePlayerPowerUp() {
		return whitePlayerPowerUp;
	}

	public void setWhitePlayerPowerUp(String powerUp) {
		this.whitePlayerPowerUp = powerUp;
	}

	public String getBlackPlayerPowerUp() {
		return blackPlayerPowerUp;
	}

	public void setBlackPlayerPowerUp(String powerUp) {
		this.blackPlayerPowerUp = powerUp;
	}
	
	public boolean getWhiteExtraMove() {
		return whiteExtraMove;
	}
	
	public void setWhiteExtraMove(boolean v) {
		this.whiteExtraMove = v;
	}
	
	public boolean getBlackExtraMove() {
		return blackExtraMove;
	}
	
	public void setBlackExtraMove(boolean v) {
		this.blackExtraMove = v;
	}
	
	public int getWhiteFrozenPieceRow() {
		return whiteFrozenPieceRow;
	}
	
	public void setWhiteFrozenPieceRow(int v) {
		this.whiteFrozenPieceRow = v;
	}
	
	public int getWhiteFrozenPieceCol() {
		return whiteFrozenPieceCol;
	}
	
	public void setWhiteFrozenPieceCol(int v) {
		this.whiteFrozenPieceCol = v;
	}
	
	public int getBlackFrozenPieceRow() {
		return blackFrozenPieceRow;
	}
	
	public void setBlackFrozenPieceRow(int v) {
		this.blackFrozenPieceRow = v;
	}
	
	public int getBlackFrozenPieceCol() {
		return blackFrozenPieceCol;
	}
	
	public void setBlackFrozenPieceCol(int v) {
		this.blackFrozenPieceCol = v;
	}
	
	public int getWhiteEvolvedPieceRow() {
		return whiteEvolvedPieceRow;
	}
	
	public void setWhiteEvolvedPieceRow(int v) {
		this.whiteEvolvedPieceRow = v;
	}
	
	public int getWhiteEvolvedPieceCol() {
		return whiteEvolvedPieceCol;
	}
	
	public void setWhiteEvolvedPieceCol(int v) {
		this.whiteEvolvedPieceCol = v;
	}
	
	public int getBlackEvolvedPieceRow() {
		return blackEvolvedPieceRow;
	}
	
	public void setBlackEvolvedPieceRow(int v) {
		this.blackEvolvedPieceRow = v;
	}
	
	public int getBlackEvolvedPieceCol() {
		return blackEvolvedPieceCol;
	}
	
	public void setBlackEvolvedPieceCol(int v) {
		this.blackEvolvedPieceCol = v;
	}
	
	public String getLastEffectType() {
		return lastEffectType;
	}
	
	public void setLastEffectType(String t) {
		this.lastEffectType = t;
	}
	
	public int getLastEffectRow() {
		return lastEffectRow;
	}
	
	public void setLastEffectRow(int r) {
		this.lastEffectRow = r;
	}
	
	public int getLastEffectCol() {
		return lastEffectCol;
	}
	
	public void setLastEffectCol(int c) {
		this.lastEffectCol = c;
	}
	
	public int getLastEffectSourceRow() {
		return lastEffectSourceRow;
	}
	
	public void setLastEffectSourceRow(int r) {
		this.lastEffectSourceRow = r;
	}
	
	public int getLastEffectSourceCol() {
		return lastEffectSourceCol;
	}
	
	public void setLastEffectSourceCol(int c) {
		this.lastEffectSourceCol = c;
	}
	
	public int getLastEffectId() { 
		return lastEffectId;
	}
	
	public void setLastEffectId(int id) {
		this.lastEffectId = id;
	}
}

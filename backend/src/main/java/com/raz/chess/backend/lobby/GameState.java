package com.raz.chess.backend.lobby;

public class GameState {
	public enum Status {
		WAITING_FOR_PLAYERS,
		IN_PROGRESS,
		FINISHED,
		CHECKMATE,
		STALEMATE
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
	
	public GameState() {}
	public GameState(String whitePlayer, String blackPlayer, Status status, String turn, Board board) {
		this.whitePlayer = whitePlayer;
	    this.blackPlayer = blackPlayer;
	    this.status = status;
	    this.turn = turn;
	    this.board = board;
	}
	
	public String getWhitePlayer() { return whitePlayer; }
    public void setWhitePlayer(String whitePlayer) { this.whitePlayer = whitePlayer; }

    public String getBlackPlayer() { return blackPlayer; }
    public void setBlackPlayer(String blackPlayer) { this.blackPlayer = blackPlayer; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getTurn() { return turn; }
    public void setTurn(String turn) { this.turn = turn; }
    
    public Board getBoard() { return board; }
    public void setBoard(Board board) { this.board = board; }
    
    public boolean isWhiteKingSideCastle() { return canCastleKingSideWhite; }
    public void setWhiteKingSideCastle(boolean v) { this.canCastleKingSideWhite = v; }

    public boolean isWhiteQueenSideCastle() { return canCastleQueenSideWhite; }
    public void setWhiteQueenSideCastle(boolean v) { this.canCastleQueenSideWhite = v; }

    public boolean isBlackKingSideCastle() { return canCastleKingSideBlack; }
    public void setBlackKingSideCastle(boolean v) { this.canCastleKingSideBlack = v; }

    public boolean isBlackQueenSideCastle() { return canCastleQueenSideBlack; }
    public void setBlackQueenSideCastle(boolean v) { this.canCastleQueenSideBlack = v; }
    
    public int getEnPassantRow() { return enPassantRow; }
    public void setEnPassantRow(int enPassantRow) { this.enPassantRow = enPassantRow; }

    public int getEnPassantCol() { return enPassantCol; }
    public void setEnPassantCol(int enPassantCol) { this.enPassantCol = enPassantCol; }
}

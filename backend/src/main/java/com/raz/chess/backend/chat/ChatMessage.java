package com.raz.chess.backend.lobby;

public class ChatMessage {
	 public enum Type {
		 CHAT,
		 SYSTEM
	 }

	 private Type type;
	 private String sender;
	 private String content;
	 private String timestamp; // simple ISO string from server for now

	 public ChatMessage() {}

	 public ChatMessage(Type type, String sender, String content, String timestamp) {
		 this.type = type;
	     this.sender = sender;
	     this.content = content;
	     this.timestamp = timestamp;
	 }

	 public Type getType() { return type; }
	 public void setType(Type type) { this.type = type; }

	 public String getSender() { return sender; }
	 public void setSender(String sender) { this.sender = sender; }

	 public String getContent() { return content; }
	 public void setContent(String content) { this.content = content; }

	 public String getTimestamp() { return timestamp; }
	 public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}

// src/components/Chat.jsx
import React, { useEffect, useRef, useState } from "react";

function Chat({ messages, onSend }) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // auto scroll messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  // enter clicked, send chat
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <h2>Chat</h2>
      <div
        style={{
          flex: 1,
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "0.5rem",
          marginBottom: "0.5rem",
          overflowY: "auto",
        }}
      >
        {messages.map((m, i) => {
          const isSystem = m.type === "SYSTEM";
          const isMe = m.sender && m.sender !== "SYSTEM"; // tweak if you want

          if (isSystem) {
            return (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  fontSize: "0.8rem",
                  margin: "0.25rem 0",
                }}
              >
                — {m.content} —
              </div>
            );
          }

          return (
            <div key={i} style={{ marginBottom: "0.25rem" }}>
              <strong>{m.sender}: </strong>
              <span>{m.content}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <input
          style={{ flex: 1, padding: "0.4rem" }}
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default Chat;

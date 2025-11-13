import React, { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import { useLocation } from "react-router-dom";

function WebSocketTest() {
  const [client, setClient] = useState(null);
  const [lobby, setLobby] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currMessage, setCurrMessage] = useState("");

  const query = new URLSearchParams(useLocation().search);
  const name = query.get("name");

  useEffect(() => {
    const stompClient = new Client({
      brokerURL: "ws://localhost:8080/ws/websocket",
      reconnectDelay: 5000,
      debug: (str) => console.log(str),

      onConnect: () => {
        console.log("Connected!");

        // listen for lobby updates
        stompClient.subscribe("/topic/lobby", (msg) => {
          const state = JSON.parse(msg.body);
          console.log("Lobby state:", state);
          setLobby(state);
        });

        // listen for chat updates
        stompClient.subscribe("/topic/chat", (msg) => {
          const chat = JSON.parse(msg.body);
          setMessages((prev) => [...prev, chat]);
        });

        // tell server we joined
        stompClient.publish({
          destination: "/app/join",
          body: JSON.stringify({ name }),
        });
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => stompClient.deactivate();
  }, []);

  const sendChat = () => {
    if (!client || !client.connected) return;

    client.publish({
      destination: "/app/chat",
      body: JSON.stringify({
        type: "CHAT",
        sender: name,
        content: currMessage,
      }),
    });

    setCurrMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendChat();
    }
  };

  let status = "Waiting for lobby info...";
  let opponentName = null;

  if (lobby) {
    const { player1, player2 } = lobby;
    if (player1 && !player2) {
      status = "Waiting for other player to join...";
    } else if (!player1 && player2) {
      status = "Waiting for other player to join...";
    } else if (player1 && player2) {
      opponentName = player1 === name ? player2 : player1;
      status = opponentName
        ? `You are playing against ${opponentName}`
        : `Both players successfully connected!`;
    }
  }

  return (
    <div>
      <h1>Lobby</h1>
      <h2>Hello, {name}!</h2>

      <p>{status}</p>

      {lobby && (
        <div>
          <p>Player 1: {lobby.player1 || "(empty)"}</p>
          <p>Player 2: {lobby.player2 || "(empty)"}</p>
          <div>
            <h4>Chat</h4>
            <ul>
              {messages.map((m, i) => (
                <li key={i}>
                  {m.sender}: {m.content}
                </li>
              ))}
            </ul>
            <input
              placeholder="Type message here"
              onChange={(e) => {
                setCurrMessage(e.target.value);
              }}
            ></input>
            <button onClick={sendChat}>Send Message</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WebSocketTest;

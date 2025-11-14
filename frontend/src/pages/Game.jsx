import React, { useEffect, useState } from "react";
import ChessBoard from "../components/ChessBoard";
import Chat from "../components/Chat";
import { Client } from "@stomp/stompjs";
import { useLocation } from "react-router-dom";

function Game() {
  const [client, setClient] = useState(null);
  const [lobby, setLobby] = useState(null);
  const [messages, setMessages] = useState([]);
  const [gameState, setGameState] = useState(null);

  const query = new URLSearchParams(useLocation().search);
  const name = query.get("name");

  useEffect(() => {
    const stompClient = new Client({
      brokerURL: "ws://localhost:8080/ws/websocket",
      reconnectDelay: 5000,
      debug: (str) => console.log(str),

      onConnect: () => {
        console.log("Connected!");

        // listen for lobby updates (players in game)
        stompClient.subscribe("/topic/lobby", (msg) => {
          const state = JSON.parse(msg.body);
          console.log("Lobby state:", state);
          setLobby(state);
        });

        // listen for game state
        stompClient.subscribe("/topic/game", (msg) => {
          const gameState = JSON.parse(msg.body);
          console.log("Game state:", gameState);
          setGameState(gameState);
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

  // chat
  const sendChat = (text) => {
    if (!client || !client.connected) return;
    if (!text || text.trim() === "") return;

    client.publish({
      destination: "/app/chat",
      body: JSON.stringify({
        type: "CHAT",
        sender: name,
        content: text,
      }),
    });
  };

  /*if (lobby) {
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
  }*/

  return (
    <div className="game-layout">
      <div className="board-pane">
        <ChessBoard
          gameState={gameState}
          myName={name}
          onAttemptMove={(from, to) => {
            if (!client || !client.connected) return;

            client.publish({
              destination: "/app/move",
              body: JSON.stringify({
                fromRow: from[0],
                fromCol: from[1],
                toRow: to[0],
                toCol: to[1],
                player: name,
              }),
            });
          }}
        />
      </div>
      <div className="board-pane">
        <Chat messages={messages} onSend={sendChat} />
      </div>
    </div>
  );
}

export default Game;

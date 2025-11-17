import React, { useEffect, useRef, useState } from "react";
import ChessBoard from "../components/ChessBoard";
import Chat from "../components/Chat";
import { Client } from "@stomp/stompjs";
import { useLocation } from "react-router-dom";
import { getGameStatus } from "../game/engine";

function Game() {
  const [client, setClient] = useState(null);
  const [lobby, setLobby] = useState(null);
  const [messages, setMessages] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [gameStatus, setGameStatus] = useState("NORMAL");

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

          // update game status (NORMAL, CHECK, etc)
          const board = gameState.board.grid;
          const colorToMove = gameState.turn === "WHITE" ? "w" : "b";
          const status = getGameStatus(board, colorToMove);
          setGameStatus(status);
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
          gameStatus={gameStatus}
        />
      </div>
      <div className="board-pane">
        <Chat messages={messages} onSend={sendChat} />
      </div>
    </div>
  );
}

export default Game;

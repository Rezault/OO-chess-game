import React, { useEffect, useRef, useState } from "react";
import ChessBoard from "../components/ChessBoard";
import Chat from "../components/Chat";
import { useLocation, useNavigate } from "react-router-dom";
import { getGameStatus } from "../game/engine";
import PowerUp from "../components/PowerUp";
import PowerUpAnnouncement from "../components/PowerUpAnnouncement";
import GameOverAnnouncement from "../components/GameOverAnnouncement";

import { WS_URL } from "../config";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

function Game() {
  const [client, setClient] = useState(null);
  const [lobby, setLobby] = useState(null);
  const [messages, setMessages] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [gameStatus, setGameStatus] = useState("NORMAL");
  const [choosingPowerUpSquare, setChoosingPowerUpSquare] = useState(false);
  const [activePowerUpAnnouncement, setActivePowerUpAnnouncement] =
    useState(null);

  const query = new URLSearchParams(useLocation().search);
  const [name, setName] = useState(query.get("name"));

  const navigate = useNavigate();

  useEffect(() => {
    const stompClient = new Client({
      //brokerURL: "ws://localhost:8080/ws/websocket",
      //brokerURL: WS_URL,
      webSocketFactory: () => new SockJS(WS_URL),
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

          if (gameState) {
            // update game status (NORMAL, CHECK, etc)
            const board = gameState.board.grid;
            const colorToMove = gameState.turn === "WHITE" ? "w" : "b";
            const status = getGameStatus(gameState, board, colorToMove);
            setGameStatus(status);
          }
        });

        // power ups
        stompClient.subscribe("/topic/powerUpUsed", (msg) => {
          const powerUpName = msg.body;
          console.log(powerUpName);
          const powerUpTypes = [
            "Freeze Piece",
            "Extra Move",
            "Evolve Piece",
            "Disintegration",
            "Betrayal",
          ];

          if (powerUpName && powerUpTypes.includes(powerUpName)) {
            setActivePowerUpAnnouncement({
              type: powerUpName,
            });
          }
        });

        // listen for chat updates
        stompClient.subscribe("/topic/chat", (msg) => {
          const chat = JSON.parse(msg.body);
          setMessages((prev) => [...prev, chat]);
        });

        stompClient.subscribe("/user/queue/private", (msg) => {
          console.log("private msg");
          const data = JSON.parse(msg.body);
          setMessages((prev) => [...prev, data]);

          if (data.type === "SYSTEM" && data.content.includes("now:")) {
            const newName = data.content.split("now: ")[1].trim();
            console.log(newName);
            setName(newName);
          }
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

  const usePowerUp = (r, c) => {
    if (!client || !client.connected) return;
    client.publish({
      destination: "/app/use-powerup",
      body: JSON.stringify({
        playerName: name,
        row: r,
        col: c,
      }),
    });
  };

  return (
    <div className="game-layout">
      <PowerUp
        gameState={gameState}
        myName={name}
        onUsePowerUp={() => {
          usePowerUp(-1, -1);
        }}
        choosePowerUpSquare={(v) => {
          // allow/disallow the player to choose a square for a power up
          setChoosingPowerUpSquare(v);
        }}
      />
      <div className="board-pane">
        <ChessBoard
          gameState={gameState}
          myName={name}
          onAttemptMove={(from, to, promotion) => {
            if (!client || !client.connected) return;

            client.publish({
              destination: "/app/move",
              body: JSON.stringify({
                fromRow: from[0],
                fromCol: from[1],
                toRow: to[0],
                toCol: to[1],
                player: name,
                promotion: promotion,
              }),
            });
          }}
          choosingPowerUpSquare={choosingPowerUpSquare}
          receivePowerUpSquare={(r, c) => {
            // send row/col chosen to server
            setChoosingPowerUpSquare(false);
            usePowerUp(r, c);
          }}
        />
      </div>
      <div className="chat-pane">
        <Chat messages={messages} onSend={sendChat} />
      </div>

      <PowerUpAnnouncement
        powerUp={activePowerUpAnnouncement}
        onClose={() => setActivePowerUpAnnouncement(null)}
      />

      <GameOverAnnouncement
        result={
          gameStatus === "CHECKMATE"
            ? "CHECKMATE"
            : gameStatus === "STALEMATE"
            ? "STALEMATE"
            : null
        }
        winner={
          gameStatus === "CHECKMATE"
            ? gameState?.turn === "WHITE"
              ? "Black" // white was in checkmate
              : "White"
            : null
        }
        onHome={() => navigate("/")}
      />
    </div>
  );
}

export default Game;

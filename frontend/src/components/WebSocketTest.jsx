import React, { useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";

function WebSocketTest() {
  const [client, setClient] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const stompClient = new Client({
      brokerURL: "ws://localhost:8080/ws/websocket",
      reconnectDelay: 5000,
      debug: (str) => console.log(str),

      onConnect: () => {
        console.log("Connected!");

        stompClient.subscribe("/topic/greetings", (msg) => {
          setMessages((prev) => [...prev, msg.body]);
        });
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => stompClient.deactivate();
  }, []);

  const sendHello = () => {
    if (!client || !client.connected) return;

    client.publish({
      destination: "/app/hello",
      body: "Hello from React!",
    });
  };

  return (
    <div>
      <button onClick={sendHello}>Send Hello</button>

      <ul>
        {messages.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    </div>
  );
}

export default WebSocketTest;

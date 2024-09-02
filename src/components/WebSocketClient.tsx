// src/components/WebSocketClient.tsx

import React, { useState, useEffect, useCallback } from 'react';
import useWebSocket from 'react-use-websocket';

const WebSocketClient = () => {
  // WebSocket URL
  const socketUrl = 'ws://localhost:8080'; // Replace with your WebSocket server URL

  // State to manage message history
  const [messageHistory, setMessageHistory] = useState<any[]>([]);

  // Initialize WebSocket connection
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    shouldReconnect: (closeEvent) => true, // Reconnect on errors
  });

  // Handle incoming messages
  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const parsedData = JSON.parse(lastMessage.data);
        setMessageHistory((prev) => [...prev, parsedData]);
      } catch (e) {
        console.log('Received non-JSON message:', lastMessage.data);
      }
    }
  }, [lastMessage]);

  // Function to send a message to the WebSocket server
  const handleClickSendMessage = useCallback(() => {
    sendMessage(JSON.stringify({ message: 'Hello from client!' }));
  }, [sendMessage]);

  // Connection status mapping
  const connectionStatus = {
    0: 'Connecting',
    1: 'Open',
    2: 'Closing',
    3: 'Closed',
  }[readyState];

  return (
    <div>
      <h1>WebSocket Client</h1>
      <button onClick={handleClickSendMessage}>Send Message</button>
      <div>
        <h2>Connection Status: {connectionStatus}</h2>
        <h3>Message History:</h3>
        <ul>
          {messageHistory.map((msg, index) => (
            <li key={index}>{JSON.stringify(msg)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WebSocketClient;

const WebSocket = require('ws');

// Create a WebSocket server on port 8681
const server = new WebSocket.Server({ port: 8681 });

let clients = [];
let playlist = []; // Store playlist here

server.on('connection', (ws) => {
  console.log('New client connected');

  // Initialize client object with ws and deviceId (undefined initially)
  const client = { ws, deviceId: null };

  clients.push(client);

  // Send current playlist to the newly connected client as a JSON string
  ws.send(JSON.stringify({ playlist }));

  // Handle incoming messages from clients
  ws.on('message', (message) => {
    try {
      // Parse the incoming message (assuming it's in JSON format)
      const data = JSON.parse(message);
      console.log({ data });

      // If the message contains a deviceId, store it in the client object
      if (data.deviceId) {
        client.deviceId = data.deviceId;
      }

      switch (data.action) {
        case 'add':
          if (data.url) {
            playlist.push(data.url);
            broadcastUpdate('add', data.url, data.deviceId);
          }
          break;
        case 'clear':
          playlist = [];
          broadcastUpdate('clear', null, data.deviceId);
          break;
        case 'remove':
          if (data.url) {
            playlist = playlist.filter(item => item !== data.url);
            broadcastUpdate('remove', data.url, data.deviceId);
          }
          break;
      }

    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
    clients = clients.filter(c => c.ws !== ws);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const broadcastUpdate = (action, url, targetDeviceId) => {
  const message = JSON.stringify({ action, url , targetDeviceId});

  clients.forEach(client => {
    if (client.ws.readyState === WebSocket.OPEN && (!targetDeviceId || client.deviceId === targetDeviceId)) {
      client.ws.send(message);
    }
  });
};

const socketUrl = process.env.WEBSOCKET_URL || "wss://viewer.atemkeng.de/ws";
// const socketUrl = process.env.WEBSOCKET_URL || "ws://localhost:8681";
console.log('WebSocket server running on:', socketUrl);

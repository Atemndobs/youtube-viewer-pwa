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

      // Handle different actions based on the message
      switch (data.action) {
        case 'add':
          if (data.url) {
            console.log('Adding to playlist:', data.url);
            console.log('Current device if:', data.deviceId);
            
            
            playlist.push(data.url);
            broadcastPlaylist(data.deviceId); // Broadcast the updated playlist to the specific deviceId
          }
          break;
        case 'clear':
          playlist = []; // Clear the playlist
          broadcastPlaylist(); // Broadcast the updated (empty) playlist
          break;
        case 'remove':
          if (data.url) {
            playlist = playlist.filter(item => item !== data.url);
            broadcastPlaylist(); // Broadcast the updated playlist
          }
          break;
        default:
          console.error('Default action:', data.action);
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

// Function to broadcast playlist updates to all clients or specific deviceId
const broadcastPlaylist = (targetDeviceId) => {
  const message = JSON.stringify({ playlist });

  console.log('Broadcasting playlist update ------------------');
  console.log({
    targetDeviceId,
    playlist,
    clients
  });
  


  clients.forEach(client => {
    if (client.ws.readyState === WebSocket.OPEN) {
      // If targetDeviceId is provided, send only to matching clients
      if (!targetDeviceId || client.deviceId === targetDeviceId) {
        console.log('Sending to client:', client.deviceId);
        client.ws.send(message);
      }
    }
  });
};

// Export the broadcast function and playlist state
module.exports = {
  broadcastPlaylist,
  updatePlaylist: (newPlaylist) => {
    playlist = newPlaylist;
    broadcastPlaylist();
  }
};

const socketUrl = process.env.WEBSOCKET_URL || 'ws://localhost:8681';
console.log('WebSocket server running on:', socketUrl);

const WebSocket = require('ws');

// Create a WebSocket server on port 8681
const server = new WebSocket.Server({ port: 8681 });

let clients = [];
let playlist = []; // Store playlist here

server.on('connection', (ws) => {
  console.log('New client connected');

  clients.push(ws);

  // Send current playlist to the newly connected client as a JSON string
  ws.send(JSON.stringify({ playlist }));

  // Handle incoming messages from clients
  ws.on('message', (message) => {
    console.log(`Received message => ${message}`);
    console.log(JSON.parse(message));
    
    
    try {
      // Parse the incoming message (assuming it's in JSON format)
      const data = JSON.parse(message);

      // Handle different actions based on the message
      switch (data.action) {
        case 'add':
          if (data.url) {
            playlist.push(data.url);
            broadcastPlaylist(); // Broadcast the updated playlist
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
          console.error('Unknown action:', data.action);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }

    // Broadcast the message to all connected clients
    // clients.forEach(client => {
    //   if (client !== ws && client.readyState === WebSocket.OPEN) {
    //     client.send(message);
    //   }
    // });
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log('Client disconnected');
    clients = clients.filter(client => client !== ws);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Function to broadcast playlist updates to all clients
const broadcastPlaylist = () => {
  const message = JSON.stringify({ playlist });

  console.log('Broadcasting playlist update');

  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
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
const socketUrl = process.env.WEBSOCKET_URL || 'wss://viewer.atemkeng.de/ws'

console.log('WebSocket server running on:', socketUrl);



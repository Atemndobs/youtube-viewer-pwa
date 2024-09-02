const WebSocket = require('ws');

// Create a WebSocket server on port 8681
const server = new WebSocket.Server({ port: 8681 });

let clients = [];
let playlist = []; // Store playlist here

server.on('connection', (ws) => {

  console.log('New client connected From =====');
  clients.push(ws);

  // Send current playlist to the newly connected client
  ws.send(JSON.stringify({ playlist }));

  // Handle incoming messages from clients
  ws.on('message', (message) => {
    console.log(`Received message => ${message}`);
    
    // Broadcast the message to all connected clients
    clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
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
  console.log({ message }); 
  
  clients.forEach(client => {
    console.log('Sending message to client', { message });
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

// Export the broadcast function and playlist state
module.exports = {
  broadcastPlaylist,
  updatePlaylist: (newPlaylist) => {
    console.log('!!!!!!!!!!!!!!!!!!!!!@ Updating playlist before broadcast');
    console.log({ newPlaylist });
    

    playlist = newPlaylist;
    broadcastPlaylist();
  }
};

console.log('WebSocket server running on ws://localhost:8681');

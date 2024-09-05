import { NextApiRequest, NextApiResponse } from 'next';
import { isValidYouTubeUrl } from '../../src/utils';
import usePlaylistStore from '../../src/store/playlistStore'; // Correct import
import WebSocket from 'ws'; // Use WebSocket for server-side

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { url, action }: { url?: string; action?: 'remove' | 'clear' } = req.body;

    // Access the Zustand store
    const playlistStore = usePlaylistStore.getState();

    if (action === 'clear') {
      // Clear the playlist
      playlistStore.clearPlaylist();

      // WebSocket Communication
      const socketUrl = process.env.WEBSOCKET_URL || 'wss://viewer.atemkeng.de/ws';
      const ws = new WebSocket(socketUrl);

      ws.on('open', () => {
        ws.send(JSON.stringify({ action: 'clear' }));
        ws.close(); // Close the WebSocket after sending the message
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      return res.status(200).json({ message: 'Playlist cleared', playlist: playlistStore.playlist });
    }

    if (action === 'remove') {
      if (!url) {
        return res.status(400).json({ error: 'URL is required for remove action' });
      }

      // Check if the URL is in the playlist
      if (!playlistStore.playlist.includes(url)) {
        return res.status(404).json({ error: 'URL not found in playlist' });
      }

      // Remove URL from playlist
      playlistStore.removePlaylist(url);

      // WebSocket Communication
      const socketUrl = process.env.WEBSOCKET_URL || 'wss://viewer.atemkeng.de/ws';
      const ws = new WebSocket(socketUrl);

      ws.on('open', () => {
        ws.send(JSON.stringify({ action: 'remove', url }));
        ws.close(); // Close the WebSocket after sending the message
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      return res.status(200).json({ message: 'URL removed from playlist', playlist: playlistStore.playlist });
    }

    // Default action is to add the URL
    if (url) {
      if (!isValidYouTubeUrl(url)) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
      }

      // Check if the URL is already in the playlist
      if (playlistStore.playlist.includes(url)) {
        console.log({
          message: 'URL already in playlist',
          playlist: playlistStore.playlist,
        });
        
        return res.status(200).json({ message: 'URL already in playlist', playlist: playlistStore.playlist });
      }

      // Add URL to playlist if not already present
      playlistStore.addToPlaylist(url);
      const updatedPlaylist = playlistStore.playlist;

      // WebSocket Communication
      const socketUrl = process.env.WEBSOCKET_URL || 'wss://viewer.atemkeng.de/ws';
      const ws = new WebSocket(socketUrl);

      ws.on('open', () => {
        ws.send(JSON.stringify({ action: 'add', url }));
        ws.close(); // Close the WebSocket after sending the message
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      return res.status(200).json({ message: 'URL added to playlist', playlist: updatedPlaylist });
    } else {
      return res.status(400).json({ error: 'URL is required for add action' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

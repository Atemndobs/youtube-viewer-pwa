import { NextApiRequest, NextApiResponse } from 'next';
import { isValidYouTubeUrl } from '../../src/utils';
import usePlaylistStore from '../../src/store/playlistStore'; // Correct import
import WebSocket from 'ws'; // Use WebSocket for server-side

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!isValidYouTubeUrl(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Access the current playlist
    const playlist = usePlaylistStore.getState().playlist;

    // Check if the URL is already in the playlist
    if (playlist.includes(url)) {
      return res.status(200).json({ message: 'URL already in playlist', playlist });
    }

    // Add URL to playlist if not already present
    usePlaylistStore.getState().addToPlaylist(url);
    const updatedPlaylist = usePlaylistStore.getState().playlist;
    console.log('Updated playlist:', updatedPlaylist);

    // WebSocket Communication
    const socketUrl = process.env.WEBSOCKET_URL || 'wss://viewer.atemkeng.de/ws'
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
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

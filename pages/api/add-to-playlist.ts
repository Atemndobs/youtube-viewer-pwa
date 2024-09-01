// pages/api/add-to-playlist.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { isValidYouTubeUrl } from '../../src/utils';
import usePlaylistStore from '../../src/store/playlistStore';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { url } = req.body;

    if (url) {
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
      return res.status(200).json({ message: 'URL added to playlist', playlist: updatedPlaylist });
    } else {
      return res.status(400).json({ error: 'URL is required' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

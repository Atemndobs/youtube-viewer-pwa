import { NextApiRequest, NextApiResponse } from 'next';

// In-memory playlist storage
let playlist: string[] = [];

// API handler function
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { url } = req.body;

    if (url) {
      // Validate URL
      const isValid = /^(https?\:\/\/)?(www\.youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}$/.test(url);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid YouTube URL' });
      }

      // Add URL to playlist if not already present
      if (!playlist.includes(url)) {
        playlist.push(url);
        console.log('Updated playlist:', playlist);
        return res.status(200).json({ message: 'URL added to playlist', playlist });
      } else {
        return res.status(200).json({ message: 'URL already in playlist', playlist });
      }
    } else {
      return res.status(400).json({ error: 'URL is required' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

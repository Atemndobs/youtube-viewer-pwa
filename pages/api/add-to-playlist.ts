import { NextApiRequest, NextApiResponse } from 'next';

// In-memory playlist storage
let playlist: string[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { url } = req.body;

    if (url) {
      playlist.push(url);
      console.log('Updated playlist:', playlist);
      res.status(200).json({ message: 'URL added to playlist', playlist });
    } else {
      res.status(400).json({ error: 'URL is required' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

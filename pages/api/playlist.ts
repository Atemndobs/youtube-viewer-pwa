import { NextApiRequest, NextApiResponse } from 'next';

// Re-use the playlist from add-to-playlist API
let playlist: string[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json({ playlist });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

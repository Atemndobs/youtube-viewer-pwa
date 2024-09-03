import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || ''; // Make sure to set this in your environment variables

type Data = {
  success: boolean;
  videoUrls?: string[];
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { listId } = req.query;

  if (!listId || typeof listId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Invalid or missing playlist ID',
    });
  }

  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=${listId}&key=${YOUTUBE_API_KEY}`
    );

    if (response.data.items && response.data.items.length > 0) {
      const videoUrls = response.data.items.map((item: any) => {
        return `https://www.youtube.com/watch?v=${item.contentDetails.videoId}`;
      });

      return res.status(200).json({
        success: true,
        videoUrls,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'No videos found in this playlist',
      });
    }
  } catch (error) {
    console.error('Error fetching playlist videos:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch playlist videos',
    });
  }
}

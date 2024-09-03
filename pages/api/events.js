// pages/api/events.ts
import { NextApiRequest, NextApiResponse } from 'next';
import usePlaylistStore from '../../src/store/playlistStore';
import { use } from 'react';

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    console.log('Client connected to API EVENTS ===============');
    console.log({
      "PLAYLIST": usePlaylistStore.getState().playlist
    });


    const sendPlaylistUpdate = () => {
      const playlist = usePlaylistStore.getState().playlist;
      res.write(`data: ${JSON.stringify({ playlist })}\n\n`);
    };

    sendPlaylistUpdate();

    const intervalId = setInterval(sendPlaylistUpdate, 1000);

    req.on('close', () => {
      console.log('Client disconnected');
      clearInterval(intervalId);
      res.end();
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

"use client";

import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Layout, Card, Input, Button, Space, Switch, List, message } from 'antd';
import { PlayCircleOutlined, StopOutlined, BackwardOutlined, ForwardOutlined } from '@ant-design/icons';

const { Content } = Layout;

const isValidYouTubeUrl = (url: string): boolean => {
  const regex = /^(https?\:\/\/)?(www\.youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}$/;
  return regex.test(url);
};

const YouTubePlayer: React.FC = () => {
  const [videoId, setVideoId] = useState('');
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [inputUrl, setInputUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Delay playback by 1 second if autoplay is enabled
    const timer = setTimeout(() => {
      if (isPlayerReady && player && videoId && autoPlay) {
        player.playVideo();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [videoId, isPlayerReady, player, autoPlay]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setInputUrl(url);
    setError('');
    const id = url.split('v=')[1]?.split('&')[0];
    setVideoId(id || '');
    setIsPlayerReady(false);
  };

  const addToPlaylist = async () => {
    if (!inputUrl) return;

    if (!isValidYouTubeUrl(inputUrl)) {
      setError("Please enter a valid YouTube URL.");
      return;
    }

    try {
      const response = await fetch('/api/add-to-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: inputUrl }),
      });
      const data = await response.json();

      if (response.ok) {
        setPlaylist(data.playlist);
        message.success('URL added to playlist');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('An error occurred while adding to the playlist.');
    }
  };

  const handlePlaylistItemClick = (url: string) => {
    const id = url.split('v=')[1]?.split('&')[0];
    setVideoId(id || '');
    setInputUrl(url);
    setIsPlayerReady(false);
    if (autoPlay) {
      setTimeout(() => player?.playVideo(), 500);
    }
  };

  const onPlayerReady = (event: { target: YT.Player }) => {
    setPlayer(event.target);
    setIsPlayerReady(true);
    console.log('Player is ready');
  };

  const playVideo = () => {
    player?.playVideo();
  };

  const stopVideo = () => {
    player?.stopVideo();
  };

  const rewindVideo = () => {
    const currentTime = player?.getCurrentTime() || 0;
    player?.seekTo(currentTime - 10, true);
  };

  const forwardVideo = () => {
    const currentTime = player?.getCurrentTime() || 0;
    player?.seekTo(currentTime + 10, true);
  };

  return (
    <Layout>
      <Content style={{ padding: '50px', display: 'flex', justifyContent: 'center', background: 'black' }}>
        <Card
          title="YouTube Video Viewer"
          bordered={false}
          style={{ width: '100%', maxWidth: '800px', background: 'black' }}
        >
          <div className="mb-4 flex items-center">
            <Switch
              checked={autoPlay}
              onChange={() => setAutoPlay(prev => !prev)}
              className="mr-2"
            />
            <span className="text-gray-400">Autoplay</span>
          </div>

          <Input
            placeholder="Enter YouTube video URL"
            value={inputUrl}
            onChange={handleInputChange}
            onFocus={(e) => e.target.select()}
            className="mb-5 bg-gray-400"
          />
          <Button type="primary" onClick={addToPlaylist} className="mb-5">
            Add to Playlist
          </Button>

          {error && (
            <div className="mb-4 p-2 bg-red-600 text-white">
              {error}
            </div>
          )}

          {videoId && (
            <div style={{ marginBottom: '20px', position: 'relative', paddingTop: '56.25%', background: 'black' }}>
              <YouTube
                videoId={videoId}
                onReady={onPlayerReady}
                opts={{ width: '100%', height: '100%' }}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'black' }}
              />
            </div>
          )}

          <Space style={{ display: 'flex', justifyContent: 'space-around' }}>
            <Button type="primary" icon={<PlayCircleOutlined />} onClick={playVideo}>
              Play
            </Button>
            <Button type="default" icon={<StopOutlined />} onClick={stopVideo}>
              Stop
            </Button>
            <Button type="default" icon={<BackwardOutlined />} onClick={rewindVideo}>
              Rewind 10s
            </Button>
            <Button type="default" icon={<ForwardOutlined />} onClick={forwardVideo}>
              Forward 10s
            </Button>
          </Space>

          <List
            header={<div style={{ color: 'white' }}>Playlist</div>}
            bordered
            dataSource={playlist}
            renderItem={(url) => (
              <List.Item onClick={() => handlePlaylistItemClick(url)} style={{ cursor: 'pointer', color: 'white' }}>
                {url}
              </List.Item>
            )}
            style={{ marginTop: '20px', background: 'black' }}
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default YouTubePlayer;

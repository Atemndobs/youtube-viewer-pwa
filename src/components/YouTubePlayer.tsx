"use client";

import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Layout, Card, Input, Button, Space, Switch, List } from 'antd';
import { PlayCircleOutlined, StopOutlined, BackwardOutlined, ForwardOutlined, PlusOutlined } from '@ant-design/icons';

const { Content } = Layout;

const YouTubePlayer: React.FC = () => {
  const [videoId, setVideoId] = useState('');
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    fetchPlaylist();
  }, []);

  const fetchPlaylist = async () => {
    try {
      const res = await fetch('/api/playlist');
      const data = await res.json();
      setPlaylist(data.playlist);
    } catch (error) {
      console.error('Failed to fetch playlist:', error);
    }
  };

  const addToPlaylist = async () => {
    if (!currentUrl) return;

    if (playlist.includes(currentUrl)) {
      console.log('URL already in playlist:', currentUrl);
      return;  // Prevent adding the same URL again
    }

    try {
      const res = await fetch('/api/add-to-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: currentUrl }),
      });

      const data = await res.json();

      if (data.playlist) {
        console.log('Adding to playlist:', currentUrl);
        setPlaylist(data.playlist); // Update playlist state with the new playlist
      } else {
        console.error('Error: No playlist returned from API');
      }
    } catch (error) {
      console.error('Failed to add to playlist:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setCurrentUrl(url);
    const id = url.split('v=')[1]?.split('&')[0];
    setVideoId(id || '');
    setIsPlayerReady(false);
  };

  const onPlayerReady = (event: { target: YT.Player }) => {
    setPlayer(event.target);
    setIsPlayerReady(true);
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
            onChange={handleInputChange}
            onClick={(e) => e.currentTarget.select()}
            className="mb-5 bg-gray-400"
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={addToPlaylist}
            style={{ marginBottom: '20px' }}
          >
            Add to Playlist
          </Button>

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
            header={<div>Playlist</div>}
            bordered
            dataSource={playlist}
            renderItem={url => (
              <List.Item onClick={() => handleInputChange({ target: { value: url } } as React.ChangeEvent<HTMLInputElement>)}>
                {url}
              </List.Item>
            )}
            style={{ marginTop: '20px' }}
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default YouTubePlayer;

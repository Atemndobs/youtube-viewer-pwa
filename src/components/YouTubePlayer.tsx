"use client";

import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Layout, Card, Input, Button, Space, Switch } from 'antd';
import { PlayCircleOutlined, StopOutlined, BackwardOutlined, ForwardOutlined } from '@ant-design/icons';


const { Content } = Layout;

const YouTubePlayer: React.FC = () => {
  const [videoId, setVideoId] = useState('');
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false); // State to control autoplay


  

  useEffect(() => {
    // Delay playback by 1 second if autoplay is enabled
    const timer = setTimeout(() => {
      if (isPlayerReady && player && videoId && autoPlay) {
        player.playVideo();
      }
    }, 1000); // 1000 milliseconds = 1 second

    // Clean up the timer if videoId changes before the timer completes
    return () => clearTimeout(timer);
  }, [videoId, isPlayerReady, player, autoPlay]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    const id = url.split('v=')[1]?.split('&')[0]; // Extract video ID from YouTube URL
    setVideoId(id || '');
    setIsPlayerReady(false); // Reset player readiness when a new video ID is set
  };

  const onPlayerReady = (event: { target: YT.Player }) => {
    setPlayer(event.target);
    setIsPlayerReady(true); // Set player as ready when the player is initialized
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
      {/* Main Content */}
      <Content style={{ padding: '50px', display: 'flex', justifyContent: 'center', background: 'black' }}>
        <Card
          title="YouTube Video Viewer"
          bordered={false}
          style={{ width: '100%', maxWidth: '800px', background: 'black' }}
        >
          {/* Autoplay Toggle */}
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
            className="mb-5 bg-gray-400"
          />
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
        </Card>
      </Content>
    </Layout>
  );
};

export default YouTubePlayer;

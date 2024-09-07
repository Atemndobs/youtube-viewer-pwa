import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Layout, Card, Input, Button, Space, Switch, List, notification } from 'antd';
import { PlayCircleOutlined, StopOutlined, BackwardOutlined, ForwardOutlined, MinusCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { isValidYouTubeUrl, validateAndConvertYouTubeUrl } from '../utils';
import useWebSocket from 'react-use-websocket';
import WebSocketStatus from './WebSocketStatus';
import { url } from 'inspector';
require('dotenv').config();

const { Content } = Layout;

const YouTubePlayer: React.FC = () => {
  const [videoId, setVideoId] = useState('');
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [playlist, setPlaylist] = useState<string[]>([]); // Use React state for playlist management
  // const socketUrl = process.env.WEBSOCKET_URL || 'wss://viewer.atemkeng.de/ws';
  const socketUrl = process.env.WEBSOCKET_URL || 'ws://localhost:8681';

  const generateDeviceId = () => {
    const deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36); // Simple unique ID generator
    localStorage.setItem('deviceId', deviceId);
    return deviceId;
  };


  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    shouldReconnect: () => true, // Reconnect on errors
    onOpen: () => {
      // Send the deviceId to the WebSocket server as the first message
      const deviceId = localStorage.getItem('deviceId') || generateDeviceId(); // Generate or retrieve deviceId
      sendMessage(JSON.stringify({ deviceId, 'action': 'status' }));
      console.log('WebSocket connection opened, deviceId sent:', deviceId);
    },
    onMessage: (message) => {
      const data = JSON.parse(message.data);
      if (data.playlist) {
        setPlaylist(data.playlist); // Update playlist if received from the server
      }
    },
  });
  const validatedUrl = validateAndConvertYouTubeUrl(inputUrl);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setInputUrl(url.trim());

    if (isValidYouTubeUrl(url)) {
      const id = url.includes('list=') ? '' : url.split('v=')[1]?.split('&')[0];
      setVideoId(id || '');
      setIsPlayerReady(false);
    } else {
      notification.error({
        message: 'Invalid URL',
        description: 'Please enter a valid YouTube URL.',
      });
    }
  };

  useEffect(() => {
    // Delay playback by 1 second if autoplay is enabled
    const timer = setTimeout(() => {
      if (isPlayerReady && player && videoId && autoPlay) {
        player.playVideo();
      }
    }, 1000);

    // Clean up the timer if videoId changes before the timer completes
    return () => clearTimeout(timer);
  }, [videoId, isPlayerReady, player, autoPlay]);

  // Function to handle playlist item click
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
  };

  // Functions to control video playback
  const playVideo = () => player?.playVideo();
  const stopVideo = () => player?.stopVideo();
  const rewindVideo = () => player?.seekTo((player?.getCurrentTime() || 0) - 10, true);
  const forwardVideo = () => player?.seekTo((player?.getCurrentTime() || 0) + 10, true);


  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage !== null) {
      console.info('Received Last message from WebSocket:', { lastMessage });

      try {
        const data = JSON.parse(lastMessage.data);
        console.log('Received PLAYLIST from WebSocket:', data);

        // Extract deviceId from the WebSocket message
        const deviceId = localStorage.getItem('deviceId') || generateDeviceId(); // Generate or retrieve deviceId
        // Ensure the message is intended for this device
        console.log('Device ID:', deviceId);
        console.log('WebSocket Device ID:', data.targetDeviceId);
        console.log({data});
        
        
        
        if (data.targetDeviceId === deviceId) {
          switch (data.action) {
            case 'add':
              setPlaylist((prevPlaylist) => [...prevPlaylist, data.url]);
              // check that newliy added url does not exit in db
              const existingUrl = playlist.find((item) => item === data.url);
              if (!existingUrl) {
                notification.success({
                  message: 'Playlist Items',
                  description: `${data.url} added to  Playlist`,
                });
              }

              break;
            case 'remove':
              setPlaylist((prevPlaylist) => prevPlaylist.filter(item => item !== data.url));
                notification.info({
                  message: 'Removed from Playlist',
                  // description: `${data.url} removed   Playlist`,
                });
              break;
            case 'clear':
              setPlaylist([]);
              notification.info({
                message: 'Playlist is Empty',
                // description: `your Playlist is empty`,
              });
              break;
            default:
              console.log('Unknown action:', data.action);
          }

        } else {
          console.log('No playlist data received from WebSocket');
          // notification.info({
          //   message: 'Playlist Items',
          //   description: `${currentPlaylistCount} in Playlist`,
          // });
        }
      } catch (error) {
        console.error('Error parsing WebSocket data:', error);
        notification.error({
          message: 'Error',
          description: 'Failed to parse data from the WebSocket.',
        });
      }
    }
  }, [lastMessage, setPlaylist]);








  // Fetch playlist from SQLite on component mount
  useEffect(() => {
    const deviceId = localStorage.getItem('deviceId') || generateDeviceId(); // Generate or retrieve deviceId
    const fetchPlaylist = async () => {
      try {
        const response = await fetch('/api/playlist', {
          method: 'GET',
          headers: { 'device-id': deviceId },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched playlist from server:', data);
          if (data.playlist) {
            const urls = data.playlist.map((item: string) => item);
            setPlaylist(urls);
          } else {
            notification.warning({
              message: 'No Playlist Found',
              description: 'The playlist is currently empty.',
            });
          }
        } else {
          notification.error({
            message: 'Error fetching playlist',
            description: 'Failed to load the playlist from the server.',
          });
        }
      } catch (error) {
        console.error('Failed to fetch playlist:', error);
        notification.error({
          message: 'Error',
          description: 'An error occurred while fetching the playlist.',
        });
      }
    };
    fetchPlaylist();
  }, []);


  // Add video or playlist to the playlist (API interaction)
  const addToPlaylist = async () => {
    const deviceId = localStorage.getItem('deviceId') || generateDeviceId(); // Generate or retrieve deviceId
    if (!validatedUrl) {
      notification.error({ message: 'Invalid URL', description: 'Please enter a valid YouTube URL.' });
      return;
    }

    if (!playlist.includes(validatedUrl)) {
      try {
        const response = await fetch('/api/playlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: validatedUrl, action: 'add', deviceId }),
        });
        const data = await response.json();
        if (response.ok) {
          setPlaylist([...playlist, validatedUrl]);
        } else {
          notification.error({ message: 'Error adding URL', description: data.error });
        }
      } catch (error) {
        console.error('Failed to add URL to playlist:', error);
        notification.error({
          message: 'Error',
          description: 'An error occurred while adding the URL to the playlist.',
        });
      }
      setInputUrl('');
    }
  };


  // Remove a video from the playlist
  const removeFromPlaylist = async (url: string) => {
    const deviceId = localStorage.getItem('deviceId') || generateDeviceId(); // Generate or retrieve deviceId
    try {
      const response = await fetch('/api/playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, action: 'remove', deviceId }),
      });
      if (response.ok) {
        setPlaylist(playlist.filter((item) => item !== url));
      } else {
        const data = await response.json();
        notification.error({ message: 'Error removing URL', description: data.error });
      }
    } catch (error) {
      console.error('Failed to remove URL from playlist:', error);
      notification.error({
        message: 'Error',
        description: 'An error occurred while removing the URL from the playlist.',
      });
    }
  };

  // Clear the playlist
  const clearPlaylist = async () => {
    try {
      const deviceId = localStorage.getItem('deviceId')
      const response = await fetch('/api/playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear', deviceId }),
      });
      if (response.ok) {
        setPlaylist([]);
      } else {
        notification.error({ message: 'Error clearing playlist' });
      }
    } catch (error) {
      console.error('Failed to clear playlist:', error);
      notification.error({
        message: 'Error',
        description: 'An error occurred while clearing the playlist.',
      });
    }
  };



  return (
    <Layout>
      <Content style={{ padding: '50px', display: 'flex', justifyContent: 'center', background: isDarkMode ? 'black' : 'white' }}>
        <Card
          title="YouTube Video Viewer"
          bordered={false}
          style={{ width: '100%', maxWidth: '800px', background: isDarkMode ? 'black' : '#ffffff' }}
          extra={
            <div className="mb-4 flex items-center">
              <Switch
                checked={isDarkMode}
                onChange={() => setIsDarkMode(prev => !prev)}
                className="mr-2"
              />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                Dark Mode
              </span>
            </div>
          }
        >

          <WebSocketStatus />

          <div className="mb-4 flex items-center">
            <Switch
              checked={autoPlay}
              onChange={() => setAutoPlay(prev => !prev)}
              className="mr-2"
            />
            <span className="text-gray-400">Autoplay</span>
          </div>

          <Input
            placeholder="Enter YouTube video or playlist URL"
            value={inputUrl}
            onChange={handleInputChange}
            onFocus={(e) => e.target.select()}
            className="mb-5 bg-gray-400"
          />
          <Button type="primary" onClick={addToPlaylist} className="mb-5">
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
            <Button type="link" icon={<PlayCircleOutlined />} onClick={playVideo}>
              Play
            </Button>
            <Button type="link" icon={<StopOutlined />} onClick={stopVideo}>
              Stop
            </Button>
            <Button type="link" icon={<BackwardOutlined />} onClick={rewindVideo}>
              Rewind 10s
            </Button>
            <Button type="link" icon={<ForwardOutlined />} onClick={forwardVideo}>
              Forward 10s
            </Button>
          </Space>

          <List
            header={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                <span>Playlist</span>
                <Button
                  icon={<MinusCircleOutlined />}
                  onClick={clearPlaylist}
                  style={{ color: 'white', border: 'none', background: 'transparent' }}
                >
                  Clear
                </Button>
              </div>
            }
            bordered
            style={{ marginTop: '20px', background: 'grrey' }}

            dataSource={playlist}
            renderItem={(url) => (
              <List.Item
                onClick={() => handlePlaylistItemClick(url)}
                style={{ cursor: 'pointer', color: 'gray', display: 'flex', justifyContent: 'space-between' }}
              >
                <Button type="link" icon={<PlayCircleOutlined />} onClick={playVideo}>
                  Play
                </Button>
                {url}
                <Button
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the parent click event
                    removeFromPlaylist(url); // Function to remove item from playlist
                  }}
                  style={{ color: 'white', border: 'none', background: 'transparent' }}
                />
              </List.Item>
            )}

          />
        </Card>
      </Content>
    </Layout>
  );
};

export default YouTubePlayer;

import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Layout, Card, Input, Button, Space, Switch, List, notification } from 'antd';
import { PlayCircleOutlined, StopOutlined, BackwardOutlined, ForwardOutlined, MinusCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { isValidYouTubeUrl, validateAndConvertYouTubeUrl } from '../utils';
import { appwriteClient, appwriteDatabase } from '../utils/appwrite/client'; // Import your Appwrite client setup
import {  Query } from 'appwrite'; // Adjust according to your SDK version and types
import { COLLECTION_ID, DATABASE_ID } from 'src/utils/constants';

const { Content } = Layout;

const YouTubePlayer: React.FC = () => {
  const [videoId, setVideoId] = useState('');
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [playlist, setPlaylist] = useState<string[]>([]);

  const generateDeviceId = () => {
    const deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('deviceId', deviceId);
    return deviceId;
  };

  const validatedUrl = validateAndConvertYouTubeUrl(inputUrl);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

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
    const timer = setTimeout(() => {
      if (isPlayerReady && player && videoId && autoPlay) {
        player.playVideo();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [videoId, isPlayerReady, player, autoPlay]);

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

  const playVideo = () => player?.playVideo();
  const stopVideo = () => player?.stopVideo();
  const rewindVideo = () => player?.seekTo((player?.getCurrentTime() || 0) - 10, true);
  const forwardVideo = () => player?.seekTo((player?.getCurrentTime() || 0) + 10, true);

  interface PlaylistPayload {
    deviceId: string;
    url: string;
  }

//   useEffect(() => {
//     const deviceId = localStorage.getItem('deviceId') || generateDeviceId();
//     console.log('Before Fetching Playlist_________________________');
//     console.log('Device ID:', deviceId);
    
    
  
//     const fetchPlaylist = async () => {
//       try {
//         const response = await fetch('/api/playlist', {
//           method: 'GET',
//           headers: { 'device-id': deviceId },
//         });
  
//         if (response.ok) {
//           const data = await response.json();
//           if (data.playlist) {
//             setPlaylist(data.playlist);
//           } else {
//             notification.warning({
//               message: 'No Playlist Found',
//               description: 'The playlist is currently empty.',
//             });
//           }
//         } else {
//           notification.error({
//             message: 'Error fetching playlist',
//             description: 'Failed to load the playlist from the server.',
//           });
//         }
//       } catch (error) {
//         notification.error({
//           message: 'Error',
//           description: 'An error occurred while fetching the playlist.',
//         });
//       }
//     };
  
//     fetchPlaylist();

//     console.log('goin tto subscribe_________________________');
    
//       // Subscribe to real-time updates
//       appwriteClient.subscribe('playlists', response => {
//         console.log('Subscription response:', response);
//         fetchPlaylist();
      
//     });

// }, []);

  





  // Fetch playlist from SQLite on component mount
  useEffect(() => {
    const deviceId = localStorage.getItem('deviceId') || generateDeviceId(); // Generate or retrieve deviceId
    appwriteClient.subscribe(`databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`, response => {
      const payload = response.payload as PlaylistPayload; // Cast to the expected type
      const subscribedDeviceId = payload.deviceId;
      const url = payload.url;
      const events = response.events;
  
      if (deviceId === subscribedDeviceId && events.includes('databases.*.collections.*.documents.*.create')) {
        console.log('---------inside create event subscribe------------------');
        console.log('Adding URL to playlist:', url);
        console.log('Device ID:', deviceId);
  
        setPlaylist(prevPlaylist => {
          // Check if the URL already exists in the playlist
          if (!prevPlaylist.includes(url)) {
            return [...prevPlaylist, url];
          }
          return prevPlaylist; // No changes if the URL is already present
        });
      }

    })

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
            description: 'Failed to load the playlist from the server.' + deviceId,
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



  const addToPlaylist = async () => {
    const deviceId = localStorage.getItem('deviceId') || generateDeviceId();
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
    } else {
      notification.warning({ message: 'URL already in Playlist', description: 'Please enter a new YouTube URL.' });
    }
  };

  const removeFromPlaylist = async (url: string) => {
    const deviceId = localStorage.getItem('deviceId') || generateDeviceId();
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

  const clearPlaylist = async () => {
    try {
      const deviceId = localStorage.getItem('deviceId');
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
                    e.stopPropagation();
                    removeFromPlaylist(url);
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

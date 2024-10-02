// src/components/YouTubePlayer.tsx
import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Avatar, Layout, Card, Input, Button, Space, Switch, List, notification, Pagination } from 'antd';
import {
  PlayCircleOutlined,
  StopOutlined,
  BackwardOutlined,
  ForwardOutlined,
  MinusCircleOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
  UserOutlined,
  MoonOutlined,
  SunOutlined,
  SyncOutlined,
  StepBackwardOutlined,
  StepForwardOutlined
} from '@ant-design/icons';
import { getYouTubePlaylistVideos, isValidYouTubeUrl, validateAndConvertYouTubeUrl, generateRandomUsername } from '../utils';
import pb from '../utils/pocketbaseClient';

const { Content } = Layout;

const YouTubePlayer: React.FC = () => {
  const [videoId, setVideoId] = useState('');
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [inputUrl, setInputUrl] = useState('');
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [deviceId, setDeviceId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Adjust as needed

  const generateDeviceId = () => {
    const newDeviceId = generateRandomUsername()
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('deviceId', newDeviceId );
    }
    return newDeviceId;
  };

  const getUsername = () => {
    let parts = deviceId.split('-');  // Split the deviceId by '-'
    let username = parts.slice(0, 3).join('-');  // Join only the first three parts
    return username;
}


  const getDeviceIdFromUrl = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('deviceId') || '';
  };

  const validatedUrl = validateAndConvertYouTubeUrl(inputUrl);
  // Initialize isDarkMode from local storage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedDarkMode = window.localStorage.getItem('darkMode');
      return storedDarkMode !== null ? JSON.parse(storedDarkMode) : true; // Default to true (dark mode)
    }
    return true; // Default to true (dark mode) if localStorage is not available
  });
  const playVideo = () => player?.playVideo();
  const stopVideo = () => player?.stopVideo();
  const rewindVideo = () => player?.seekTo((player?.getCurrentTime() || 0) - 10, true);
  const forwardVideo = () => player?.seekTo((player?.getCurrentTime() || 0) + 10, true);
  
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current video index

  interface PlaylistItem {
    url: string;
    title: string;
  }

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
    // Check if deviceId is passed in URL or generate a new one
    const urlDeviceId = getDeviceIdFromUrl();
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedDeviceId = window.localStorage.getItem('deviceId');
      if (urlDeviceId) {
        setDeviceId(urlDeviceId);
        window.localStorage.setItem('deviceId', urlDeviceId); // Store it in local storage for future use
      } else if (storedDeviceId) {
        setDeviceId(storedDeviceId);
      } else {
        const newDeviceId = generateDeviceId();
        setDeviceId(newDeviceId);
      }
    }
  }, []);

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

  // Fetch playlist from PocketBase on component mount
  useEffect(() => {``
    subscribeToPlaylist();
    fetchPlaylist();
  }, []);

  // create a function to subscribe to the playlist collection for this deviceId in pocketbase and update the playlist state
  const subscribeToPlaylist = async () => {
    const deviceId = localStorage.getItem('deviceId') || generateDeviceId();
    pb.collection('playlist').subscribe('*', (data) => {
      console.log('Playlist updated:', {
        deviceId,
        data
      });
      
      if (data.action === 'create' && data.record.deviceId === deviceId) {
        // Add new item to the playlist
        const newItem: PlaylistItem = {
          url: data.record.url,
          title: data.record.title
        };
        setPlaylist(prevPlaylist => {
          if (!prevPlaylist.some(item => item.url === newItem.url)) {
            return [newItem, ...prevPlaylist];
          }
          return prevPlaylist;
        });
      } else if (data.action === 'delete' && data.record.deviceId === deviceId) {
        // Remove item from the playlist
        setPlaylist(prevPlaylist => prevPlaylist.filter(item => item.url !== data.record.url));
      } else if (data.action === 'update' && data.record.deviceId === deviceId) {
        // Update existing item in the playlist
        setPlaylist(prevPlaylist => prevPlaylist.map(item => 
          item.url === data.record.url ? { ...item, title: data.record.title } : item
        ));
      }
    });
  };


  const fetchPlaylist = async () => {
    const deviceId = localStorage.getItem('deviceId') || generateDeviceId();
    try {
      pb.autoCancellation(false)
      const records = await pb.collection('playlist').getFullList({
        sort: '-created',
        filter: `deviceId = "${deviceId}"`
      });
      
      const items = records.map(record => ({
        url: record.url,
        title: record.title,
        id: record._id,
        deviceId: record.deviceId
      }));
      
      setPlaylist(items);
    } catch (error) {
      console.error('Failed to fetch playlist:', error);
      notification.error({
        message: 'Error',
        description: 'An error occurred while fetching the playlist.',
      });
    }
  };

  // Add to Playlist function
  const addToPlaylist = async () => {
    const validatedUrl = validateAndConvertYouTubeUrl(inputUrl); // Corrected name
    console.log('VALID URL:', validatedUrl);

    if (!validatedUrl) {
      notification.error({
        message: 'Invalid URL',
        description: 'Please enter a valid YouTube video or playlist URL.',
      });
      return;
    }

    try {
      const deviceId = localStorage.getItem('deviceId') || generateDeviceId();

      // Check if it's a playlist URL
      const isPlaylistUrl = /list=/.test(validatedUrl);

      // Fetch all videos if it's a playlist
      if (isPlaylistUrl) {
        const videoUrls = await getYouTubePlaylistVideos(validatedUrl);

        if (!videoUrls) {
          notification.error({
            message: 'Error',
            description: 'Failed to fetch videos from the playlist.',
          });
          return;
        }

        // Add each video URL to the playlist
        videoUrls.forEach(async (url) => {
          try {
            const response = await fetch('/api/playlist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url, action: 'add', deviceId }),
            });
            const data = await response.json();

            if (response.ok) {
              const { title } = data;
              setPlaylist((prevPlaylist) => {
                if (!prevPlaylist.some((item) => item.url === url)) {
                  return [{ url, title }, ...prevPlaylist];
                }
                return prevPlaylist;
              });
            } else {
              notification.error({
                message: 'Error adding video',
                description: data.error,
              });
            }
          } catch (error) {
            console.error('Failed to add video to playlist:', error);
          }
        });
      } else {
        // Handle single video URL case
        const response = await fetch('/api/playlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: validatedUrl, action: 'add', deviceId }),
        });

        const data = await response.json();

        if (response.ok) {
          const { title } = data;
          setPlaylist((prevPlaylist) => {
            if (!prevPlaylist.some((item) => item.url === validatedUrl)) {
              return [{ url: validatedUrl, title }, ...prevPlaylist];
            }
            return prevPlaylist;
          });
        } else {
          notification.error({
            message: 'Error adding URL',
            description: data.error,
          });
        }
      }

      setInputUrl(''); // Clear the input after adding
    } catch (error) {
      console.error('Error fetching video or playlist:', error);
      notification.error({
        message: 'Error',
        description: 'An error occurred while adding the URL to the playlist.',
      });
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
        // Update playlist by filtering out the item with the matching URL
        setPlaylist(prevPlaylist => prevPlaylist.filter(item => item.url !== url));
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
        console.log(response.json());

        // Clear the playlist by setting it to an empty array
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

  // Function to skip to the next video in the playlist
  const skipToNext = () => {
    if (currentIndex < playlist.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      playVideoAtIndex(nextIndex);
    } else {
      notification.info({
        message: "End of Playlist",
        description: "You've reached the end of the playlist.",
      });
    }
  };

  // Function to skip to the previous video in the playlist
  const skipToPrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      playVideoAtIndex(prevIndex);
    } else {
      notification.info({
        message: "Start of Playlist",
        description: "You're already at the first video.",
      });
    }
  };

  // Helper function to play video at a specific index
  const playVideoAtIndex = (index: number) => {
    const video = playlist[index];
    const id = video.url.split('v=')[1]?.split('&')[0];
    setVideoId(id || '');
    setIsPlayerReady(false);
    if (autoPlay) {
      setTimeout(() => player?.playVideo(), 500);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPlaylist = playlist.slice(startIndex, endIndex);

  // Function to handle the end of a video
  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    if (event.data === YT.PlayerState.ENDED && playlist.length > 0) {
      skipToNext();
    }
  };

  // Update local storage when isDarkMode changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    }
  }, [isDarkMode]);

  return (
    <Layout>
      <Content style={{ padding: '50px', display: 'flex', justifyContent: 'center', background: isDarkMode ? 'black' : 'white' }}>
        <Card
          title="YouTube Video Viewer"
          bordered={false}
          style={{ width: '100%', maxWidth: '800px', background: isDarkMode ? 'black' : '#ffffff' }}
          extra={
            <div className="mb-4 flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <div className="flex items-center">
                <Switch
                  checkedChildren={<SunOutlined />}
                  unCheckedChildren={<MoonOutlined />}
                  checked={isDarkMode}
                  onChange={() => setIsDarkMode(!isDarkMode)}
                />
              </div>

              {/* Autoplay Toggle */}
              <div className="flex items-center">
                <Switch
                  checked={autoPlay}
                  checkedChildren={<PlayCircleOutlined />}
                  unCheckedChildren={<StopOutlined />}
                  onChange={() => setAutoPlay(prev => !prev)}
                  className="mr-2"
                />
                <span className="text-gray-400">Autoplay</span>
              </div>

              {/* User Info with Icon  */}
              <div className="flex items-center">
                <Avatar icon={<UserOutlined />} className="mr-2" />
                <span className="text-gray-400">{getUsername()}</span>
              </div>
            </div>
          }
        >
            <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            placeholder="Enter YouTube video or playlist URL"
            value={inputUrl}
            onChange={handleInputChange}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addToPlaylist();
              }
            }}
            className="mb-5 bg-gray-400"
          />
          {/* Conditionally render the Add to Playlist button */}
          {inputUrl.trim() !== '' && (
            <Button type="primary" onClick={addToPlaylist} className="mb-5">
              Add to Playlist
            </Button>
          )}

          {videoId && (
            <div style={{ marginBottom: '20px', position: 'relative', paddingTop: '56.25%', background: 'black' }}>
              <YouTube
                videoId={videoId}
                onReady={onPlayerReady}
                opts={{ width: '100%', height: '100%' }}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'black' }}
                onStateChange={onPlayerStateChange} // Add onStateChange handler
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
                RR 
              </Button>
              <Button type="link" icon={<ForwardOutlined />} onClick={forwardVideo}>
                FF 
              </Button>
              <Button type="link" icon={<StepBackwardOutlined />} onClick={skipToPrevious}>
                Prev
              </Button>
              <Button type="link" icon={<StepForwardOutlined />} onClick={skipToNext}>
                Skip
              </Button>
            </Space>
          <List
            header={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
                <span>Watchlist</span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <UnorderedListOutlined style={{ marginRight: '8px', color: 'white' }} />
                  <span style={{ color: 'white', marginRight: '16px' }}>{playlist.length}</span>
                  <Button
                    icon={<SyncOutlined />}
                    onClick={fetchPlaylist}
                    style={{ color: 'white', border: 'none', background: 'transparent' }}
                  >
                  </Button>
                  <Button
                    icon={<MinusCircleOutlined />}
                    onClick={clearPlaylist}
                    style={{ color: 'white', border: 'none', background: 'transparent' }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            }
            bordered
            style={{ marginTop: '20px', background: 'grrey' }}
            dataSource={paginatedPlaylist}
            renderItem={({ url, title }) => (
              <List.Item
                onClick={() => handlePlaylistItemClick(url)}
                style={{ cursor: 'pointer', color: 'gray', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >

                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Button type="link" icon={<PlayCircleOutlined />} onClick={playVideo}>
                    Play
                  </Button>
                  <span 
                  style={{ marginLeft: '8px', color: isDarkMode ? 'white' : 'black',}} 
                  onClick={playVideo} 
                  >
                    {title}
                  </span>
                </div>
                <Button
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromPlaylist(url);
                  }}
                  style={{ color: isDarkMode ? 'white' : 'black', border: 'none', background: 'transparent' }}
                />
              </List.Item>
            )}
          />
              <Pagination
                current={currentPage}
                pageSize={itemsPerPage}
                total={playlist.length}
                onChange={handlePageChange}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '16px',
                  fontSize: '12px',
                }}
              />
            </Space>
        </Card>
      </Content>
    </Layout>
  
  );
};

export default YouTubePlayer;


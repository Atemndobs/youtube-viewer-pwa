// src/components/YouTubePlayer.tsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
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
  StepForwardOutlined,
  CalendarOutlined,
  EyeOutlined,
  HeartOutlined,
  ReloadOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined
} from '@ant-design/icons';
import { getYouTubePlaylistVideos, isValidYouTubeUrl, validateAndConvertYouTubeUrl, generateRandomUsername } from '../utils';
import pb from '../utils/pocketbaseClient';
import { ThemeContext } from '../context/ThemeContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableListItem } from '../components/DraggableListItem'
import { useMediaQuery } from 'react-responsive';

const { Content } = Layout;

const YouTubePlayer: React.FC = () => {
  const [videoId, setVideoId] = useState('');
  const [videoStats, setVideoStats] = useState<{ uploadedAt: string, views: number, likes: number } | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [inputUrl, setInputUrl] = useState('');
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [deviceId, setDeviceId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Adjust as needed
  const playVideo = () => player?.playVideo();
  const stopVideo = () => player?.stopVideo();
  const rewindVideo = () => player?.seekTo((player?.getCurrentTime() || 0) - 10, true);
  const forwardVideo = () => player?.seekTo((player?.getCurrentTime() || 0) + 10, true);
  const [currentVideo, setCurrentVideo] = useState<PlaylistItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current video index
  const [isClient, setIsClient] = useState(false);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const themeContext = useContext(ThemeContext);
  if (!themeContext) {
    // Handle missing context error (e.g., if the provider is not found)
    throw new Error('useContext must be used within a ThemeProvider');
  }
  const { isDarkMode, toggleTheme } = themeContext;


  const animalIcons = [
    <span role="img" aria-label="monkey">🐒</span>,
    <span role="img" aria-label="dog">🐕</span>,
    <span role="img" aria-label="cat">🐈</span>,
    <span role="img" aria-label="fox">🦊</span>,
    <span role="img" aria-label="lion">🦁</span>,
    <span role="img" aria-label="elephant">🐘</span>,
    <span role="img" aria-label="panda">🐼</span>,
    <span role="img" aria-label="tiger">🐅</span>,
    <span role="img" aria-label="rabbit">🐇</span>,
    <span role="img" aria-label="bear">🐻</span>,
    <span role="img" aria-label="frog">🐸</span>,
    <span role="img" aria-label="penguin">🐧</span>,
    <span role="img" aria-label="koala">🐨</span>,
    <span role="img" aria-label="chicken">🐔</span>,
    <span role="img" aria-label="snake">🐍</span>,
    <span role="img" aria-label="hedgehog">🦔</span>,
    <span role="img" aria-label="whale">🐳</span>,
    <span role="img" aria-label="dolphin">🐬</span>,
    <span role="img" aria-label="zebra">🦓</span>,
    <span role="img" aria-label="giraffe">🦒</span>,
    <span role="img" aria-label="deer">🦌</span>,
    <span role="img" aria-label="turtle">🐢</span>,
    <span role="img" aria-label="octopus">🐙</span>,
    <span role="img" aria-label="scorpion">🦂</span>,
    <span role="img" aria-label="bat">🦇</span>,
    <span role="img" aria-label="squid">🦑</span>,
    <span role="img" aria-label="kangaroo">🦘</span>,
    <span role="img" aria-label="otter">🦦</span>,
    <span role="img" aria-label="camel">🐫</span>,
    <span role="img" aria-label="parrot">🦜</span>,
    <span role="img" aria-label="fish">🐟</span>,
    <span role="img" aria-label="ant">🐜</span>,
    <span role="img" aria-label="bee">🐝</span>,
    <span role="img" aria-label="butterfly">🦋</span>,
    <span role="img" aria-label="wine">🍷</span>,
  ];

  const getAnimalIcon = () => {
    return animalIcons[currentIconIndex];
  };
  const [currentIconIndex, setCurrentIconIndex] = useState<number>(0); // Default to 0

  const generateDeviceId = () => {
    const newDeviceId = generateRandomUsername()
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('deviceId', newDeviceId);
    }
    return newDeviceId;
  };


  useEffect(() => {
    const storedIndex = localStorage.getItem('currentIconIndex');
    if (storedIndex) {
      setCurrentIconIndex(parseInt(storedIndex));
    }
  }, []);

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

  // Fetch playlist from PocketBase on component mount
  useEffect(() => {
    subscribeToPlaylist();
    fetchPlaylist();
    setIsClient(true);

  }, []);
  // Update local storage when isDarkMode changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    }
  }, [isDarkMode]);

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
          title: data.record.title,
          publishedAt: data.record.publishedAt || 'No Date',
          views: data.record.views || 0,
          likes: data.record.likes || 0
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

  const handleAvatarClick = () => {
    // Increment the index to change the icon
    setCurrentIconIndex((prevIndex) => {
      const newIndex = (prevIndex + 1) % animalIcons.length;
      // Store the new index in local storage
      localStorage.setItem('currentIconIndex', newIndex.toString());
      return newIndex;
    });
  };
  const getUsername = () => {
    let parts = deviceId.split('-');  // Split the deviceId by '-'
    let username = parts.slice(0, 3).join('-');  // Join only the first three parts
    return username;
  }

  const getDeviceIdFromUrl = () => {
    const searchParams = new URLSearchParams(window.location.search);
    let deviceId = searchParams.get('deviceId') || '';

    // Check if the base URL is either http://192.168.178.67/ or localhost
    const { hostname } = window.location;
    if (hostname === '192.168.178.67' || hostname === 'localhost') {
      deviceId = 'dashing-pirate-seeker';
    }

    console.log(deviceId);
    return deviceId;
  };



  const validatedUrl = validateAndConvertYouTubeUrl(inputUrl);

  // Helper function to format views and likes
  const formatNumber = (num: number | undefined) => {
    if (!num) return '0';
    if (num >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + 'M';
    } else if (num >= 1_000) {
      return (num / 1_000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'No Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-DE', { year: 'numeric', month: 'short', day: '2-digit' });
  };

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

  const handlePlaylistItemClick = (url: string) => {
    const id = url.split('v=')[1]?.split('&')[0];
    setVideoId(id || '');
    setInputUrl('');
    setIsPlayerReady(false);
    const songIndex = playlist.findIndex(item => item.url === url);
    setCurrentIndex(songIndex)
    if (autoPlay) {
      setTimeout(() => player?.playVideo(), 100);
    }
  };

  const onPlayerReady = (event: { target: YT.Player }) => {
    setPlayer(event.target);
    setIsPlayerReady(true);
  };


  interface PlaylistItem {
    url: string;
    title: string;
    publishedAt?: string;
    views?: number;
    likes?: number;
  }
  const setCurrentSong = (video: PlaylistItem) => {
    // Then, store the current song in the state
    setCurrentVideo(video);
    handlePlaylistItemClick(video.url);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  // const paginatedPlaylist = playlist.slice(startIndex, endIndex);

  const fetchPlaylist = async () => {
    console.log({ currentIndex });

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
        deviceId: record.deviceId,
        publishedAt: record.publishedAt,
        views: record.views,
        likes: record.likes,
      }));

      if (items.length > 0) {
        setPlaylist(items);
        handlePlaylistItemClick(items[currentIndex].url);
      }
    } catch (error) {
      console.error('Failed to fetch Watchlist:', error);
      // if the playlist or currentItems are empty, set message to 'No playlist found'
      if (playlist.length === 0 || currentItems.length === 0) {
        notification.info({
          message: 'No Watchlist Item found',
          description: 'Please add a playlist or video to the watchlist.',
        });
      } else if (playlist.length || currentItems.length > 0) {
        // notification.info({
        //   message: 'Watchlist updated',
        //   description: 'Please add a playlist or video to the watchlist.',
        // });
      } else {
        notification.error({
          message: 'Error',
          description: "Can't find Watchlist",
        });
      }
    }
  };

  const reloadPage = async () => {
    console.log({ isMobile });
    // if its mobile, refresh the page after addind video
    if (isMobile && validatedUrl !== '') {
      window.location.reload();
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

      const songIndex = playlist?.findIndex(item => item.url === validatedUrl);
      setCurrentIndex(songIndex)
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
      handlePlaylistItemClick(currentItems[currentIndex].url);
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
      setTimeout(() => player?.playVideo(), 200);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Function to handle the end of a video
  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    if (event.data === YT.PlayerState.ENDED && playlist.length > 0) {
      skipToNext();
    }
  };

  // Move video function to reorder playlist
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const moveVideo = (dragIndex: number, hoverIndex: number) => {
    const updatedPlaylist = [...playlist];
    const [movedVideo] = updatedPlaylist.splice(dragIndex, 1);
    updatedPlaylist.splice(hoverIndex, 0, movedVideo);
    setPlaylist(updatedPlaylist); // Update the state with the new playlist order
  };

  // Sort playlist based on sortDirection
  const sortedPlaylist = [...playlist].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a.title.localeCompare(b.title);
    } else {
      return b.title.localeCompare(a.title);
    }
  });

  // Paginate the sorted playlist
  const currentItems = sortedPlaylist.slice(indexOfFirstItem, indexOfLastItem);



  // In the component:
  const isMobile = useMediaQuery({ maxWidth: 640 }); // Adjust for mobile
  if (!isClient) {
    // While on the server, avoid rendering mobile-specific content
    return null;
  }




  return (
    <Layout style={{ background: isDarkMode ? 'black' : 'white' }}>
      <Content style={{
        padding: isMobile ? '0px' : '20px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Card
          title={isMobile ? '' : 'Watchlist'}
          bordered={false}
          style={{
            width: isMobile ? '100%' : '800px',
            color: isDarkMode ? 'white' : 'black', border: 'none', background: 'transparent',
          }} // Set card background and text color
          extra={
            <div
              className="mb-4 flex items-center space-x-4"
              style={{
                paddingTop: isMobile ? '20px' : '0px',
              }}
            >
              {isMobile && (
                <Button
                  icon={<ReloadOutlined />}
                  onClick={reloadPage}
                  style={{ color: isDarkMode ? 'white' : 'black', border: 'none', background: 'transparent' }}
                />
              )}
              {/* Dark Mode Toggle */}
              <div className="flex items-center">
                <Switch
                  checkedChildren={<SunOutlined />}
                  unCheckedChildren={<MoonOutlined />}
                  checked={isDarkMode}
                  onChange={() => toggleTheme()}
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
                <span className="text-gray-400">{isMobile ? '' : 'Autoplay'}</span>
              </div>

              {/* User Info with Icon */}
              <div className="flex items-center">
                <Avatar
                  icon={getAnimalIcon()}
                  className="mr-2"
                  onClick={handleAvatarClick} // Attach click handler
                />
                <span className="text-gray-400">{getUsername()}</span>
              </div>
            </div>
          }
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', width: '100%' }}>
              {/* Add to Playlist button */}
              {inputUrl.trim() !== '' && (
                <Button
                  type="primary"
                  onClick={addToPlaylist}
                  style={{
                    marginRight: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  Add to Watchlist
                </Button>
              )}

              {/* Input field */}
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
                className="mb-5"
                style={{
                  flex: 1, // Make the input field take the remaining width
                  fontSize: '16px', // Set font size to prevent zooming on mobile
                  background: isDarkMode ? '#333' : '#f9f9f9', // Dark mode styling
                  color: isDarkMode ? 'white' : 'black', // Text color based on dark mode
                  borderRadius: '04px',
                  padding: '2px', // Add some padding for better touch usability
                }}
              />
            </div>



            {videoId && (
              // add video stats: when was uploaded, how many views and likes
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

            <Space
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-around',
                marginBottom: '16px',
                fontSize: '16px',
                color: '#595959'
              }}
            >
              {/* Display Stats with Icons */}
              <span>
                <CalendarOutlined style={{ marginRight: '8px' }} />
                {isMobile ? '' : 'Uploaded on: '}{formatDate(currentVideo?.publishedAt)}
              </span>
              <span>
                <EyeOutlined style={{ marginRight: '8px' }} />
                {isMobile ? '' : 'Views: '}{formatNumber(currentVideo?.views)}
              </span>
              <span>
                <HeartOutlined style={{ marginRight: '8px' }} />
                {isMobile ? '' : 'Likes: '}{formatNumber(currentVideo?.likes)}
              </span>
            </Space>

            <Space
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-around',
                gap: '8px', // Adjust the gap to control the spacing between buttons
              }}

            >
              <Button type="link" icon={<PlayCircleOutlined />} onClick={playVideo}>
                {isMobile ? '' : 'Play'}
              </Button>
              <Button type="link" icon={<StopOutlined />} onClick={stopVideo}>
                {isMobile ? '' : 'Stop'}
              </Button>
              <Button type="link" icon={<BackwardOutlined />} onClick={rewindVideo}>
                {isMobile ? '' : 'RR'}
              </Button>
              <Button type="link" icon={<ForwardOutlined />} onClick={forwardVideo}>
                {isMobile ? '' : 'FF'}
              </Button>
              <Button type="link" icon={<StepBackwardOutlined />} onClick={skipToPrevious}>
                {isMobile ? '' : 'Prev'}
              </Button>
              <Button type="link" icon={<StepForwardOutlined />} onClick={skipToNext}>
                {isMobile ? '' : 'Skip'}
              </Button>
            </Space>

            <DndProvider backend={HTML5Backend}>
              <List
                header={
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center', color: isDarkMode ? 'white' : 'black'
                  }}>
                    <span>Watchlist</span>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <UnorderedListOutlined style={{
                        marginRight: '8px',
                        color: isDarkMode ? 'white' : 'black'
                      }} />
                      <span style={{ color: isDarkMode ? 'white' : 'black', marginRight: '16px' }}>{playlist.length}</span>
                      <Button
                        icon={<SyncOutlined />}
                        onClick={fetchPlaylist}
                        style={{ color: isDarkMode ? 'white' : 'black', border: 'none', background: 'transparent' }}
                      />
                      <Button
                        onClick={() => setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))}
                        style={{ color: isDarkMode ? 'white' : 'black', border: 'none', background: 'transparent' }}
                      >
                        {sortDirection === 'asc' ? <SortDescendingOutlined /> : <SortAscendingOutlined />}
                      </Button>
                      <Button
                        icon={<MinusCircleOutlined />}
                        onClick={clearPlaylist}
                        style={{ border: 'none', background: 'transparent', color: isDarkMode ? 'white' : 'black' }}
                      >
                        {isMobile ? '' : 'Clear'}
                      </Button>
                    </div>
                  </div>
                }
                bordered
                dataSource={currentItems}
                renderItem={(video, index) => (
                  <DraggableListItem
                    key={video.url}
                    video={video}
                    index={index + indexOfFirstItem} // Full index for drag-and-drop
                    moveVideo={moveVideo}
                    setCurrentSong={setCurrentSong}
                    removeFromPlaylist={removeFromPlaylist} // Remove video from playlist
                    isDarkMode={isDarkMode} // Add your dark mode logic here
                  />
                )}
                style={{ 
                  paddingRight: isMobile ? '8px' : '0px',
                  paddingBottom: isMobile ? '8px' : '0px',
                 }}

              />
              <Pagination
                current={currentPage}
                pageSize={itemsPerPage}
                total={playlist.length}
                onChange={handlePageChange}
                style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', fontSize: '12px' }}
              />
            </DndProvider>


          </Space>
        </Card>

      </Content>
    </Layout>
  );
};

export default YouTubePlayer;
import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Layout, Card, Input, Button, Space, Switch, List, notification } from 'antd';
import { PlayCircleOutlined, StopOutlined, BackwardOutlined, ForwardOutlined, MinusCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { isValidYouTubeUrl, validateAndConvertYouTubeUrl } from '../utils';
import usePlaylistStore from '../store/playlistStore'; // Import Zustand store
import useWebSocket from 'react-use-websocket';
import WebSocketStatus from './WebSocketStatus';

const { Content } = Layout;

const YouTubePlayer: React.FC = () => {
  const [videoId, setVideoId] = useState('');
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [inputUrl, setInputUrl] = useState('');

  // Access Zustand store
  const playlist = usePlaylistStore((state) => state.playlist);
  const addToPlaylistStore = usePlaylistStore((state) => state.addToPlaylist);
  const setPlaylist = usePlaylistStore((state) => state.setPlaylist);
  const removeFromPlaylistStore = usePlaylistStore((state) => state.removePlaylist);
  const clearFromPlaylistStore = usePlaylistStore((state) => state.clearPlaylist);
  


  // WebSocket URL
const socketUrl = process.env.WEBSOCKET_URL || 'wss://viewer.atemkeng.de/ws'
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    shouldReconnect: () => true, // Reconnect on errors
  });
  const validatedUrl = validateAndConvertYouTubeUrl(inputUrl);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);


  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage !== null) {
      console.info('Received Last message from WebSocket:');
      console.info({ lastMessage });

      try {
        const data = JSON.parse(lastMessage.data);
        console.log('Received PLAYLIST from WebSocket:', data);
        // Count current playlist items
        const currentPlaylistCount = playlist.length;

        if (data.playlist) {
          setPlaylist(data.playlist); // Update Zustand store with the playlist data from WebSocket
          const playlistCount = data.playlist.length;
          // show success notification  if playlist is not empty
          if (playlistCount) {
            notification.success({
              message: 'Playlist Added',
              description: playlistCount + ' videos from the playlist have been added.',
      
            })
          }
        }else{
          console.log('No playlist data received from WebSocket');
          notification.success({
            message: 'Playlist Items',
            description: currentPlaylistCount + ' in Playlist',
    
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket data:', error);
        // notification.error({
        //   message: 'Error',
        //   description: 'Failed to parse data from the WebSocket.',
        // });
      }
    }
  }, [lastMessage, setPlaylist]);


  // Function to fetch video URLs from a playlist
  const fetchPlaylistVideos = async (playlistUrl: string) => {
    try {
      const listId = playlistUrl.split('list=')[1];
      const response = await fetch(`/api/playlist-videos?listId=${listId}`); // Assume you have an API endpoint that returns the videos
      const data = await response.json();

      if (data.success && data.videoUrls.length) {
        data.videoUrls.forEach((url: string) => {
          if (!playlist.includes(url)) {
            sendMessage(JSON.stringify({ action: 'add', url }));
            addToPlaylistStore(url);
          }
        });
        notification.success({
          message: 'Playlist Added',
          description: 'All videos from the playlist have been added.',
        });
      } else {
        notification.error({
          message: 'Error',
          description: 'Failed to retrieve videos from the playlist.',
        });
      }
    } catch (error) {
      console.error('Error fetching playlist videos:', error);
      notification.error({
        message: 'Error',
        description: 'There was an error fetching the playlist videos.',
      });
    }
  };

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

  // Add video or playlist to the playlist
  const addToPlaylist = async () => {
    if (!validatedUrl) {
      notification.error({
        message: 'Invalid URL',
        description: 'Please enter a valid YouTube URL.',
      });
      return;
    }

    if (validatedUrl.includes('list=')) {
      await fetchPlaylistVideos(validatedUrl);
    } else {
      if (!playlist.includes(validatedUrl)) {
        sendMessage(JSON.stringify({ action: 'add', url: validatedUrl }));
        addToPlaylistStore(validatedUrl); // Add to Zustand store
        setInputUrl('');
      }
    }
  };

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
  // Function to clear the playlist
  const clearPlaylist = () => {
    setPlaylist([]);
    sendMessage(JSON.stringify({ action: 'clear' }));
    clearFromPlaylistStore();
  };

  // Function to remove a specific item from the playlist
  // const removeFromPlaylist = (url: string) => {
  //   const updatedPlaylist = playlist.filter(item => item !== url);
  //   setPlaylist(updatedPlaylist);
  //   sendMessage(JSON.stringify({ action: 'remove', url }));
  //   console.log('Before Removing from playlist ----------:', url);
  //   console.log({ playlist });
    
  //   // Remove from Zustand store
  //   removeFromPlaylistStore(url);
  //   console.log('After Removing from playlist ----------:');
  //   console.log({ playlist });
  // };


  const removeFromPlaylist = (url: string) => {
    const playlist = usePlaylistStore.getState().playlist;  // Get Zustand's playlist state
    
    // Log before removing from playlist
    console.log('Before Removing from playlist ----------:', url);
    console.log('Current playlist:', playlist);
  
    // Remove URL from Zustand store
    usePlaylistStore.getState().removePlaylist(url);  // This will automatically trigger a state update in Zustand
  
    // Check updated Zustand playlist
    const updatedPlaylist = usePlaylistStore.getState().playlist;
    console.log('Updated Zustand playlist ----------:', updatedPlaylist);
  
    // Send WebSocket message to notify about the removal
    sendMessage(JSON.stringify({ action: 'remove', url }));
  
    // Log final playlist after all actions
    console.log('After Removing from playlist ----------:');

    console.log('Current playlist:', playlist);
    console.log({ playlist });
    
    
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
            dataSource={playlist} // Use Zustand playlist here
            renderItem={(url) => (
              <List.Item
                onClick={() => handlePlaylistItemClick(url)} 
                style={{ cursor: 'pointer', color: 'grey', display: 'flex', justifyContent: 'space-between' }}
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
            style={{ marginTop: '20px', background: 'black' }}
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default YouTubePlayer;

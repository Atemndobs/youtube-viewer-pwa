"use client";

import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Layout, Card, Input, Button, Space, Switch, List, notification } from 'antd';
import { PlayCircleOutlined, StopOutlined, BackwardOutlined, ForwardOutlined, ReloadOutlined, MinusCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { isValidYouTubeUrl, validateAndConvertYouTubeUrl } from '../utils';
import usePlaylistStore from '../store/playlistStore'; // Import Zustand store
import useWebSocket from 'react-use-websocket';

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

  // WebSocket URL
  const socketUrl = 'ws://localhost:8681'; // Replace with your WebSocket server URL
  // Initialize WebSocket connection
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    shouldReconnect: (closeEvent) => true, // Reconnect on errors
  });
  const validatedUrl = validateAndConvertYouTubeUrl(inputUrl);

  // Function to clear the playlist
  const clearPlaylist = () => {
    setPlaylist([]);
    sendMessage(JSON.stringify({ action: 'clear' })); // Notify WebSocket server to clear playlist
  };

  // Function to remove a specific item from the playlist
  const removeFromPlaylist = (url: string) => {
    const updatedPlaylist = playlist.filter(item => item !== url);
    setPlaylist(updatedPlaylist);
    sendMessage(JSON.stringify({ action: 'remove', url })); // Notify WebSocket server to remove item
  };


  // Handle incoming messages
  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const data = JSON.parse(lastMessage.data);
        console.log('Received data from WebSocket:', data);
        if (data.playlist) {
          setPlaylist(data.playlist);
        }
        // addToPlaylistStore(data.playlist); // Add to Zustand store
        // addToPlaylistStore(data.playlist); 
        // setPlaylist(data.playlist); 
      } catch (error) {
        console.error('Error parsing WebSocket data:', error);
        notification.error({
          message: 'Error',
          description: 'Failed to parse data from the WebSocket.',
        }); 
      }
    }
  }, [lastMessage, setPlaylist]);

  // Handle connection status changes
  useEffect(() => {
    console.log(`WebSocket connection status: ${readyState}`);
  }, [readyState]);



  // useEffect(() => {
  //   const ws = new WebSocket('ws://localhost:8681');

  //   ws.onmessage = (event) => {
  //     try {
  //       const data = JSON.parse(event.data);
  //       console.log('Received data from WebSocket:', data);
  //       //setPlaylist(data.playlist); // Update Zustand store with the playlist data from WebSocket
  //       addToPlaylistStore(data.playlist); // Update Zustand store with the playlist data from WebSocket      
  //     } catch (error) {
  //       console.error('Error parsing WebSocket data:', error);
  //       notification.error({
  //         message: 'Error',
  //         description: 'Failed to parse data from WebSocket.',
  //       });
  //     }
  //   };

  //   ws.onerror = (error) => {
  //     console.error('WebSocket error:', error);
  //     notification.error({
  //       message: 'Connection Error',
  //       description: 'Failed to connect to the server for real-time updates.',
  //     });
  //   };

  //   ws.onclose = () => {
  //     console.log('WebSocket connection closed');
  //   };

  //   return () => {
  //     ws.close();
  //   };
  // }, [setPlaylist]);




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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    const validatedUrl = validateAndConvertYouTubeUrl(url) ?? '';
    setInputUrl(validatedUrl);
    const id = validatedUrl.split('v=')[1]?.split('&')[0];
    setVideoId(id || '');
    setIsPlayerReady(false); // Reset player readiness when a new video ID is set
  };

  const addToPlaylist = async () => {

    console.log( '===========ADD TO PLAYLIST========' );
    if (!validatedUrl) {
      notification.error({
        message: 'Invalid URL',
        description: 'Please enter a valid YouTube URL.',
      });
      return;
    }
    

    if (!playlist.includes(validatedUrl)) {
      sendMessage(JSON.stringify({ action: 'add', url: validatedUrl }));
      addToPlaylistStore(validatedUrl); // Add to Zustand store
      setInputUrl('');
    }

    // try {
    //   const response = await fetch('/api/add-to-playlist', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ url: inputUrl }),
    //   });

    //   const data = await response.json();
    //   if (response.ok) {
    //     notification.success({
    //       message: 'Success',
    //       description: data.message,
    //     });
    //   } else {
    //     notification.error({
    //       message: 'Error',
    //       description: data.error,
    //     });
    //   }
    // } catch (error) {
    //   notification.error({
    //     message: 'Network Error',
    //     description: 'There was an error communicating with the server.',
    //   });
    // }
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

 

  const refreshPlaylist = async () => {
    console.log( '===========REFRESH BUTTON========' );
    console.log( {playlist} );
    const playlistStored = usePlaylistStore.getState().playlist;

    console.log( '===========STORED PLAYLIST========' );
    console.log( {playlistStored} );
    
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      console.log("Fetched data:", data); // Add this line to debug
      setPlaylist(data.playlist); // Update Zustand store with the refreshed playlist
      notification.success({
        message: 'Playlist Refreshed',
        description: 'The playlist has been successfully refreshed.',
      });
    } catch (error) {
      notification.error({
        message: 'Refresh Error',
        description: 'There was an error refreshing the playlist.',
      });
    }
  };
  

  return (
    <Layout>
      <Content style={{ padding: '50px', display: 'flex', justifyContent: 'center', background: 'black'}}>
        <Card
          title="YouTube Video Viewer"
          className='bg-gray-950 text-white'
          bordered={false}
          style={{ width: '100%', maxWidth: '800px' }}
          // extra={
          //   <Button icon={<ReloadOutlined />} onClick={refreshPlaylist} style={{ color: 'white', border: 'none', background: 'transparent' }}>
          //     Refresh
          //   </Button>
          // }
        >
          {/* <div>
            <button onClick={() => sendMessage('Hello')}>Send Message</button>
            <p>Last message: {lastMessage ? lastMessage.data : null}</p>
          </div> */}

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
                  icon={<MinusCircleOutlined  /> }
                  onClick={clearPlaylist} // Function to clear the playlist
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
                style={{ cursor: 'pointer', color: 'white', display: 'flex', justifyContent: 'space-between' }}
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

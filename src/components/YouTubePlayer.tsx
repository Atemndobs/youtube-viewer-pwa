import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Avatar, Layout, Card, Input, Button, Space, Switch, List, notification, Pagination } from 'antd';
import { PlayCircleOutlined, StopOutlined, BackwardOutlined, ForwardOutlined, MinusCircleOutlined, DeleteOutlined, UnorderedListOutlined, UserOutlined, MoonOutlined, SunOutlined, PlusOutlined } from '@ant-design/icons';
import { getYouTubePlaylistVideos, getYouTubeVideoTitle, isValidYouTubeUrl, validateAndConvertYouTubeUrl } from '../utils';
import { appwriteClient, appwriteDatabase } from '../utils/appwrite/client'; // Import your Appwrite client setup
import { Query } from 'appwrite'; // Adjust according to your SDK version and types
import { COLLECTION_ID, DATABASE_ID } from 'src/utils/constants';
import { title } from 'process';
import LibrarySidebarComponent from './LibrarySidebarComponent';
// import { useLocation } from 'react-router-dom'; // Add this if you're using react-router


const { Content } = Layout;

const YouTubePlayer: React.FC = () => {
  const [videoId, setVideoId] = useState('');
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [inputUrl, setInputUrl] = useState('');
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [deviceId, setDeviceId] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<PlaylistItem | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [folders, setFolders] = useState<string[]>(['Coding', 'Business', 'folder 3']);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Adjust as needed
  const [isLoading, setIsLoading] = useState(false); // State for loading indicator
  const [hasMore, setHasMore] = useState(true); // State for "Load More" button

  const generateDeviceId = () => {
    const newDeviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('deviceId', newDeviceId);
    return newDeviceId;
  };

  const getDeviceIdFromUrl = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('deviceId') || '';
  };

  const validatedUrl = validateAndConvertYouTubeUrl(inputUrl);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const playVideo = () => player?.playVideo();
  const stopVideo = () => player?.stopVideo();
  const rewindVideo = () => player?.seekTo((player?.getCurrentTime() || 0) - 10, true);
  const forwardVideo = () => player?.seekTo((player?.getCurrentTime() || 0) + 10, true);

  interface PlaylistPayload {
    deviceId: string;
    url: string;
    title: string;
  }

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
    const storedDeviceId = localStorage.getItem('deviceId');

    console.log({
      urlDeviceId,
      storedDeviceId,
    });


    if (urlDeviceId) {
      setDeviceId(urlDeviceId);
      localStorage.setItem('deviceId', urlDeviceId); // Store it in local storage for future use
    } else if (storedDeviceId) {
      setDeviceId(storedDeviceId);
    } else {
      const newDeviceId = generateDeviceId();
      setDeviceId(newDeviceId);
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

  // Fetch playlist from Appwrite on component mount
  useEffect(() => {
    const deviceId = localStorage.getItem('deviceId') || generateDeviceId(); // Generate or retrieve deviceId
    appwriteClient.subscribe(`databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`, response => {
      const payload = response.payload as PlaylistPayload; // Cast to the expected type
      const subscribedDeviceId = payload.deviceId;
      const url = payload.url;
      const events = response.events;
      const title = payload.title

      if (deviceId === subscribedDeviceId && events.includes('databases.*.collections.*.documents.*.create')) {
        console.log('---------inside create event subscribe------------------');
        setPlaylist(prevPlaylist => {
          console.log('Previous playlist ==================');
          console.log({ prevPlaylist });
          if (!prevPlaylist.some(item => item.url === url)) {
            return [{ url, title }, ...prevPlaylist];
          }
          return prevPlaylist; // Return the playlist unchanged if the URL is already present
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
            console.log(data.playlist);

            const items = data.playlist.map((item: string) => item);
            setPlaylist(items.reverse()); // Reverse the order of the playlist items to match the UI
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

  // // Add to Playlist function
  // const addToPlaylist = async () => {
  //   const validUrl = validateAndConvertYouTubeUrl(inputUrl);
  //   console.log('VALID URL');

  //   console.log(validUrl);


  //   if (!validUrl) {
  //     notification.error({
  //       message: 'Invalid URL',
  //       description: 'Please enter a valid YouTube video or playlist URL.',
  //     });
  //     return;
  //   }

  //   try {

  //     const deviceId = localStorage.getItem('deviceId') || generateDeviceId();
  //     try {
  //       const response = await fetch('/api/playlist', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ url: validatedUrl, action: 'add', deviceId }),
  //       });
  //       const data = await response.json();
  //       if (response.ok) {
  //         const title  = data.title;
  //         console.log('title', title);

  //         setPlaylist(prevPlaylist => {
  //           if (!prevPlaylist.some(item => item.url === validUrl)) {
  //             // return [...prevPlaylist, { url: validUrl, title }];
  //             return [{ url: validUrl, title }, ...prevPlaylist];

  //           }
  //           return prevPlaylist;
  //         });

  //         console.log(playlist);

  //       } else {
  //         notification.error({ message: 'Error adding URL', description: data.error });
  //       }
  //     } catch (error) {
  //       console.error('Failed to add URL to playlist:', error);
  //       notification.error({
  //         message: 'Error',
  //         description: 'An error occurred while adding the URL to the playlist.',
  //       });
  //     }
  //     setInputUrl(''); // Clear the input after adding
  //   } catch (error) {
  //     console.error('Error fetching video title:', error);
  //     notification.error({
  //       message: 'Error',
  //       description: 'An error occurred while fetching the video title.',
  //     });
  //   }
  // };

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


  // const addNewPlaylistFolder = async (folderName: string, urls: PlaylistItem[]) => {
  //   const deviceId = localStorage.getItem('deviceId') || generateDeviceId();

  //   try {
  //     const response = await fetch('/api/folders', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ folderName, urls, deviceId }),
  //     });

  //     if (response.ok) {
  //       notification.success({
  //         message: 'Playlist Folder Added',
  //         description: `The folder "${folderName}" was successfully created.`,
  //       });
  //     } else {
  //       notification.error({ message: 'Error', description: 'Failed to add playlist folder.' });
  //     }
  //   } catch (error) {
  //     console.error('Error adding playlist folder:', error);
  //     notification.error({ message: 'Error', description: 'An error occurred while creating the playlist folder.' });
  //   }
  // };
  const addNewPlaylistFolder = async (folderName: string, urls: PlaylistItem[]) => {
    const deviceId = localStorage.getItem('deviceId') || generateDeviceId();
  
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderName, urls, deviceId }),
      });
  
      if (response.ok) {
        notification.success({
          message: 'Folder Created',
          description: `Successfully created the folder: ${folderName}`,
        });
        // Update folder state to include the new folder
        setFolders(prevFolders => [...prevFolders, folderName]);
      } else {
        const data = await response.json();
        notification.error({
          message: 'Error',
          description: `Failed to create folder: ${data.error}`,
        });
      }
    } catch (error) {
      console.error('Error creating playlist folder:', error);
      notification.error({
        message: 'Error',
        description: 'An error occurred while creating the playlist folder.',
      });
    }
  };
  


  const loadPlaylistFromFolder = async (folderName: string) => {
    const deviceId = localStorage.getItem('deviceId') || generateDeviceId();

    try {
      const response = await fetch(`/api/folders?folderName=${folderName}&deviceId=${deviceId}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        const items = data.urls.map((item: string) => item);
        setPlaylist(items); // Load the playlist
      } else {
        notification.error({ message: 'Error', description: 'Failed to load playlist from folder.' });
      }
    } catch (error) {
      console.error('Failed to load playlist:', error);
      notification.error({ message: 'Error', description: 'An error occurred while loading the playlist.' });
    }
  };

  const addItemToFolder = async (folderName: string, item: PlaylistItem) => {
    const deviceId = localStorage.getItem('deviceId') || generateDeviceId();
    try {
      const response = await fetch('/api/folders/add-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderName, item, deviceId }),
      });

      if (response.ok) {
        notification.success({
          message: 'Item Added',
          description: `The item was successfully added to the folder "${folderName}".`,
        });
        loadPlaylistFromFolder(folderName); // Reload playlist to reflect changes
      } else {
        notification.error({ message: 'Error', description: 'Failed to add item to the folder.' });
      }
    } catch (error) {
      console.error('Error adding item to folder:', error);
      notification.error({ message: 'Error', description: 'An error occurred while adding the item to the folder.' });
    }
  };

  const showFolderSelectionModal = () => {
    console.log('showFolderSelectionModal');

  };


  const handleAddItemToFolder = (item: PlaylistItem) => {
    setSelectedItem(item);
    showFolderSelectionModal();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // const loadMore = async () => {
  //   setIsLoading(true);
  //   try {
  //     const deviceId = localStorage.getItem('deviceId') || generateDeviceId();
  //     const response = await fetch('/api/playlist', {
  //       method: 'GET',
  //       headers: { 'device-id': deviceId },
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       const newItems = data.playlist.map((item: string) => item);
  //       setPlaylist(prevPlaylist => [...prevPlaylist, ...newItems]);
  //       setHasMore(newItems.length > 0); // Check if there are more items to load
  //     } else {
  //       notification.error({ message: 'Error loading more items' });
  //     }
  //   } catch (error) {
  //     console.error('Failed to load more items:', error);
  //     notification.error({ message: 'Error', description: 'An error occurred while loading more items.' });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPlaylist = playlist.slice(startIndex, endIndex);

  return (
    <Layout>
      {/* <LibrarySidebarComponent
        folders={['Coding', 'Business', 'folder 3']}
        onFolderClick={loadPlaylistFromFolder}
        onAddItemToFolder={addItemToFolder}
      /> */}
      <Content style={{ padding: '50px', display: 'flex', justifyContent: 'center', background: isDarkMode ? 'black' : 'white' }}>

        <Card
          title="YouTube Video Viewer"
          bordered={false}
          style={{ width: '100%', maxWidth: '800px', background: isDarkMode ? 'black' : '#ffffff' }}
          extra={
            <div className="mb-4 flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <div className="flex items-center">
                {isDarkMode ? <MoonOutlined className="mr-2 text-gray-300" /> : <SunOutlined className="mr-2 text-gray-600" />}
                <Switch
                  checked={isDarkMode}
                  onChange={() => setIsDarkMode(prev => !prev)}
                  className="mr-2"
                />
                {/* <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Dark Mode
                </span> */}
              </div>


              {/* Autoplay Toggle */}
              <div className="flex items-center">
                <Switch
                  checked={autoPlay}
                  onChange={() => setAutoPlay(prev => !prev)}
                  className="mr-2"
                />
                <span className="text-gray-400">Autoplay</span>
              </div>

              {/* User Info with Icon  */}
              <div className="flex items-center">
                <Avatar icon={<UserOutlined />} className="mr-2" />
                <span className="text-gray-400">{deviceId}</span>
                {/* <span className="text-gray-400">User: {deviceId}</span> */}
              </div>
            </div>
          }
        >

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
                <span>Watchlist</span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <UnorderedListOutlined style={{ marginRight: '8px', color: 'white' }} />
                  <span style={{ color: 'white', marginRight: '16px' }}>{playlist.length}</span> {/* Playlist counter */}
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
                  <span style={{ marginLeft: '8px', color: 'white' }}>{title}</span>
                </div>
                <Button
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromPlaylist(url);
                  }}
                  style={{ color: 'white', border: 'none', background: 'transparent' }}
                />
                {/* <Button
                  icon={<PlusOutlined />}
                  onClick={() => handleAddItemToFolder({ url, title })}
                  style={{ color: 'white', border: 'none', background: 'transparent' }}
                /> */}
              </List.Item>

            )}
          />
          {/* {hasMore && (
            <Button type="primary" onClick={loadMore} loading={isLoading} style={{ marginTop: '16px' }}>
              Load More
            </Button>
          )} */}
          {paginatedPlaylist.length > 0 && (
            <Pagination
              current={currentPage}
              onChange={handlePageChange}
              pageSize={itemsPerPage}
              total={playlist.length}
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '16px',
                background: 'black',
                color: 'white',
              }}
            />
          )}
        </Card>
      </Content>
    </Layout>
  );
};

export default YouTubePlayer;


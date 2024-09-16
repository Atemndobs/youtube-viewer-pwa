// src/utils.ts


// const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || ''; // Ensure this is in your .env

// export const isValidYouTubeUrl = (url: string): boolean => {
//   const pattern = /^(https?:\/\/)?(www\.youtube\.com\/(watch\?v=[a-zA-Z0-9_-]{11}(&.*)?|playlist\?list=[a-zA-Z0-9_-]+)|youtu\.be\/[a-zA-Z0-9_-]{11}(\?.*)?)$/;
//   return pattern.test(url);
// };

// export const validateAndConvertYouTubeUrl = (url: string): string | null => {
//   // Trim the URL to remove any leading or trailing whitespace
//   url = url.trim();

//   if (!url) {
//     return null;
//   }

//   const shortUrlPattern = /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})(\?.*)?$/;
//   const standardUrlPattern = /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}(&.*)?$/;

//   // Check if the URL matches the shortened format
//   const shortMatch = url.match(shortUrlPattern);
  
//   if (shortMatch) {
//     const videoId = shortMatch[1];
//     return `https://www.youtube.com/watch?v=${videoId}`;
//   }

//   // Check if the URL is already a standard YouTube URL
//   const isStandardUrl = standardUrlPattern.test(url);
//   if (isStandardUrl) {
//     return url;
//   }

//   // If the URL doesn't match any expected format, return null (indicating it's invalid)
//   return null;
// };



const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || ''; // Ensure this is in your .env


export const getYouTubeVideoTitle = async (url: string): Promise<string | null> => {
  const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);

  if (!videoIdMatch || !YOUTUBE_API_KEY) {
    console.error('Invalid video URL or missing YouTube API key');
    return null;
  }

  const videoId = videoIdMatch[1];
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet`;

  try {
    const response = await fetch(apiUrl);
  
    // Check if the response status is OK (status 200)
    if (!response.ok) {
      console.error('Failed to fetch YouTube video title:', response.statusText);
      return null;
    }
  
    const data = await response.json();
    const items = data.items;
  
    console.log({ items });
  
    if (items && items.length > 0) {
      return items[0].snippet.title;
    } else {
      console.error('No video data found');
      return null;
    }
  } catch (error) {
    console.error('Failed to fetch YouTube video title:', error);
    return null;
  }
  
};



export const isValidYouTubeUrl = (url: string): boolean => {
  const pattern = /^(https?:\/\/)?(www\.youtube\.com\/(watch\?v=[a-zA-Z0-9_-]{11}(&.*)?|playlist\?list=[a-zA-Z0-9_-]+)|youtu\.be\/[a-zA-Z0-9_-]{11}(\?.*)?)$/;
  return pattern.test(url);
};

export const validateAndConvertYouTubeUrl = (url: string): string | null => {
  // Trim the URL to remove any leading or trailing whitespace
  url = url.trim();

  if (!url) {
    return null;
  }

  const shortUrlPattern = /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})(\?.*)?$/;
  const standardUrlPattern = /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}(&.*)?$/;

  // Check if the URL matches the shortened format
  const shortMatch = url.match(shortUrlPattern);
  
  if (shortMatch) {
    const videoId = shortMatch[1];
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  // Check if the URL is already a standard YouTube URL
  const isStandardUrl = standardUrlPattern.test(url);
  if (isStandardUrl) {
    return url;
  }

  // If the URL doesn't match any expected format, return null (indicating it's invalid)
  return null;
};

// New function to fetch all video URLs from a YouTube playlist
export const getYouTubePlaylistVideos = async (playlistUrl: string): Promise<string[] | null> => {
  const playlistIdMatch = playlistUrl.match(/[&?]list=([a-zA-Z0-9_-]+)/);

  if (!playlistIdMatch || !YOUTUBE_API_KEY) {
    console.error('Invalid playlist URL or missing YouTube API key');
    return null;
  }

  const playlistId = playlistIdMatch[1];
  const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&key=${YOUTUBE_API_KEY}&part=snippet&maxResults=50`;

  try {
    const response = await fetch(apiUrl);
    
    // Check if the response status is OK (status 200)
    if (!response.ok) {
      console.error('Failed to fetch YouTube playlist videos:', response.statusText);
      return null;
    }

    const data = await response.json();
    const items = data.items;

    if (items && items.length > 0) {
      // Extract the video URLs from the playlist
      const videoUrls = items.map((item: any) => {
        const videoId = item.snippet.resourceId.videoId;
        return `https://www.youtube.com/watch?v=${videoId}`;
      });

      return videoUrls;
    } else {
      console.error('No videos found in the playlist');
      return null;
    }
  } catch (error) {
    console.error('Failed to fetch YouTube playlist videos:', error);
    return null;
  }
};

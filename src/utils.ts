// src/utils.ts

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
  
    if (!response.ok) {
      console.error('Failed to fetch YouTube video title:', response.statusText);
      return null;
    }
  
    const data = await response.json();
    const items = data.items;
  
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
  url = url.trim();

  if (!url) {
    return null;
  }

  const shortUrlPattern = /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})(\?.*)?$/;
  const standardUrlPattern = /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}(&.*)?$/;

  const shortMatch = url.match(shortUrlPattern);
  
  if (shortMatch) {
    const videoId = shortMatch[1];
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  const isStandardUrl = standardUrlPattern.test(url);
  if (isStandardUrl) {
    return url;
  }

  return null;
};

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
    
    if (!response.ok) {
      console.error('Failed to fetch YouTube playlist videos:', response.statusText);
      return null;
    }

    const data = await response.json();
    const items = data.items;

    if (items && items.length > 0) {
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

// New logic to generate cool, random hyphen-separated usernames
const adjectives = [
  'cool', 'fancy', 'shiny', 'brave', 'wild', 'mysterious', 'cosmic', 'fierce',
  'epic', 'brilliant', 'dashing', 'stellar', 'vivid', 'bold', 'noble'
];

const nouns = [
  'warrior', 'phoenix', 'ninja', 'pirate', 'tiger', 'dragon', 'unicorn', 
  'rider', 'wizard', 'samurai', 'knight', 'guardian', 'shadow', 'ranger', 'vortex'
];

const verbs = [
  'runner', 'jumper', 'slasher', 'fighter', 'seeker', 'breaker', 'crusher', 
  'master', 'defender', 'blaster', 'striker', 'sniper', 'rider', 'caster', 'charger'
];

// Export function to generate unique, fancy usernames
export const generateRandomUsername = (): string => {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];

  // Combine the words with hyphens
  const randomUsername = `${randomAdjective}-${randomNoun}-${randomVerb}`;

  // Ensure uniqueness by adding a timestamp or random number
  const uniqueUsername = `${randomUsername}-${Date.now().toString(36)}`;

  // Optionally store it in localStorage
  localStorage.setItem('deviceId', uniqueUsername);

  return uniqueUsername;
};
// src/utils.ts

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || ''; // Ensure this is in your .env

// Define a type for the expected video response
interface YouTubeVideoResponse {
  items: {
    snippet: {
      title: string;
      publishedAt: string
    };
    statistics: {
      viewCount: number;
      likeCount: number;
    };
  }[];
}

// Exported function to get the YouTube video title and stats
export const getYouTubeVideoTitle = async (url: string): Promise<{ title: string | null; stats: { uploadedAt: string; views: number; likes: number } | null }> => {
  const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);

  if (!videoIdMatch) {
    console.error('Invalid video URL');
    return { title: null, stats: null };
  }

  const videoId = videoIdMatch[1];
  const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet,statistics`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error(`Failed to fetch YouTube video: ${response.status} ${response.statusText}`);
      return { title: null, stats: null };
    }

    const data: YouTubeVideoResponse = await response.json();
    const items = data.items;

    if (items && items.length > 0) {
      const { title } = items[0].snippet;
      const { publishedAt } = items[0].snippet; // Accessing publishedAt directly from snippet
      const { viewCount, likeCount } = items[0].statistics; // Accessing viewCount and likeCount from statistics

      return { title, stats: { uploadedAt: publishedAt, views: viewCount, likes: likeCount } };
    } else {
      console.error('No video data found');
      return { title: null, stats: null };
    }
  } catch (error) {
    console.error('Failed to fetch YouTube video:', error);
    return { title: null, stats: null };
  }
};
// Function to format video stats
 export const formatVideoStats = (stats: { uploadedAt: string, views: string, likes: string } | null) => {
   if (!stats) return null;

   const { uploadedAt, views, likes } = stats;
   const uploadDate = uploadedAt
   const formattedViews = Number(views).toLocaleString();
   const formattedLikes = Number(likes).toLocaleString();

   return `Uploaded: ${uploadDate}, Views: ${formattedViews}, Likes: ${formattedLikes}`;
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

  console.log("THIS ISA PLAYLIST ID MATCH", playlistIdMatch);
  

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
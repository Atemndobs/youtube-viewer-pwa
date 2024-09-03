// src/utils.ts

export const isValidYouTubeUrl = (url: string): boolean => {
  const pattern = /^(https?:\/\/)?(www\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}(&.*)?|youtu\.be\/[a-zA-Z0-9_-]{11}(\?.*)?)$/;
  return pattern.test(url);
};

export const validateAndConvertYouTubeUrl = (url: string): string | null => {
  // Trim the URL to remove any leading or trailing whitespace
  url = url.trim();

  if (!url) {
    // console.info('Empty URL passed.'); // Debugging line
    return null;
  }

  const shortUrlPattern = /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})(\?.*)?$/;
  const standardUrlPattern = /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}(&.*)?$/;

  // Check if the URL matches the shortened format
  const shortMatch = url.match(shortUrlPattern);
  
  if (shortMatch) {
    const videoId = shortMatch[1];
    const queryParams = shortMatch[2] || '';
    // console.log('Converted URL:', `https://www.youtube.com/watch?v=${videoId}`);
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  // Check if the URL is already a standard YouTube URL
  const isStandardUrl = standardUrlPattern.test(url);
  if (isStandardUrl) {
    return url;
  }
  // If the URL doesn't match any expected format, return null (indicating it's invalid)
  // console.log('URL is invalid. Returning null.');
  return null;
};


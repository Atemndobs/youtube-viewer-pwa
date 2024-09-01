// src/utils.ts

export const isValidYouTubeUrl = (url: string): boolean => {
  const pattern = /^(https?\:\/\/)?(www\.youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}(&.*)?|youtu\.be\/[a-zA-Z0-9_-]{11}(&.*)?)$/;
  return pattern.test(url);
};

// You can add more utility functions here as needed

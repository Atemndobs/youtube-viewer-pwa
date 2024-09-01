// In-memory playlist storage
let playlist = [];

// Function to get the playlist
const getPlaylist = () => playlist;

// Function to add to playlist
const addToPlaylist = (url) => {
  if (!playlist.includes(url)) {
    playlist.push(url);
  }
  return playlist;
};

// Function to clear the playlist
const clearPlaylist = () => {
  playlist = [];
};

module.exports = { getPlaylist, addToPlaylist, clearPlaylist };

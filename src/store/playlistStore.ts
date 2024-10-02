import { create } from 'zustand';

// Define the shape of each playlist item
interface PlaylistItem {
  url: string;
  title: string;
  publishedAt: string,
  views: number,
  likes: number

}

interface PlaylistStore {
  playlist: PlaylistItem[]; // Update to store an array of objects with url and title
  addToPlaylist: (item: PlaylistItem) => void; // Accept a PlaylistItem object
  setPlaylist: (items: PlaylistItem[]) => void; // Accept an array of PlaylistItem objects
  removePlaylist: (url: string) => void; // Still remove by url
  clearPlaylist: () => void;
}

const usePlaylistStore = create<PlaylistStore>((set) => ({
  playlist: [],
  
  // Update to accept and add an object (url, title) to the playlist
  addToPlaylist: (item) => set((state) => ({
    playlist: [...state.playlist, item],
  })),

  // Remove by comparing the url in the object
  removePlaylist: (url) => set((state) => ({
    playlist: state.playlist.filter((item) => item.url !== url),
  })),

  // Clear the entire playlist
  clearPlaylist: () => set({ playlist: [] }),

  // Set the entire playlist with an array of PlaylistItem objects
  setPlaylist: (playlist) => set({ playlist }),
}));

export default usePlaylistStore;

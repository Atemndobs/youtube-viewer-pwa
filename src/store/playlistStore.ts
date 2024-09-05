// src/store/playlistStore.ts

import { log } from 'console';
import {create} from 'zustand';


interface PlaylistStore {
  playlist: string[];
  addToPlaylist: (url: string) => void;
  setPlaylist: (urls: string[]) => void; 
  removePlaylist: (url: string) => void;
  clearPlaylist: () => void;
}

const usePlaylistStore = create<PlaylistStore>((set) => ({
  playlist: [],
  addToPlaylist: (url) => set((state) => ({
    playlist: [...state.playlist, url]
  })),
  removePlaylist: (url) => set((state) => ({
    // playlist: state.playlist.filter((item) => item !== url)
    playlist: state.playlist.filter((item) => {
      console.log(item, url);
      
      if (item !== url) {
        return item;
      }})
    
  })),
  clearPlaylist: () => set({ 
    playlist: []
   }),
  
  setPlaylist: (playlist) => set({ playlist }),
}));

export default usePlaylistStore;

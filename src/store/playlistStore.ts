// src/store/playlistStore.ts

import {create} from 'zustand';


interface PlaylistStore {
  playlist: string[];
  addToPlaylist: (url: string) => void;
  setPlaylist: (urls: string[]) => void; // 
}

const usePlaylistStore = create<PlaylistStore>((set) => ({
  playlist: [],
  addToPlaylist: (url) => set((state) => ({
    playlist: [...state.playlist, url]
  })),
  // setPlaylist: (urls) => set(() => ({
  //   playlist: urls,
  // })), // Add this function

  setPlaylist: (playlist) => set({ playlist }),
}));

export default usePlaylistStore;

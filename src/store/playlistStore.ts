// src/store/playlistStore.ts

import {create} from 'zustand';


interface PlaylistStore {
  playlist: string[];
  addToPlaylist: (url: string) => void;
}

const usePlaylistStore = create<PlaylistStore>((set) => ({
  playlist: [],
  addToPlaylist: (url) => set((state) => ({
    playlist: [...state.playlist, url]
  })),
}));

export default usePlaylistStore;

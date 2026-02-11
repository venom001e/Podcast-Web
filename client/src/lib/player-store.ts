import { create } from 'zustand';
import type { Podcast } from '@shared/schema';

interface PlayerState {
  currentPodcast: Podcast | null;
  isPlaying: boolean;
  isExpanded: boolean;
  volume: number;
  play: (podcast: Podcast) => void;
  pause: () => void;
  resume: () => void;
  toggleExpand: () => void;
  close: () => void;
  setVolume: (vol: number) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentPodcast: null,
  isPlaying: false,
  isExpanded: false,
  volume: 1,
  
  play: (podcast) => set({ currentPodcast: podcast, isPlaying: true, isExpanded: true }),
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  toggleExpand: () => set((state) => ({ isExpanded: !state.isExpanded })),
  close: () => set({ currentPodcast: null, isPlaying: false, isExpanded: false }),
  setVolume: (volume) => set({ volume }),
}));

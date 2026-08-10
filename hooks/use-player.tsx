// hooks/use-player.ts
import { create } from "zustand";

export type RepeatMode = "off" | "all" | "one";

export interface Track {
  id: string;
  title: string;
  artistNames: string;
  imageUrl: string;
  audioUrl: string;
  albumId?: string;
  lyrics?: string;
}

interface PlayerStore {
  currentTrack: Track | null;
  queue: Track[];
  originalQueue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  isQueueVisible: boolean; // Giữ đúng tên biến UI của bạn

  // Hành động cơ bản
  setPlayState: (state: boolean) => void;
  setVolume: (volume: number) => void;
  togglePlay: () => void;
  toggleQueue: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;

  // Hành động điều hướng
  playTrack: (track: Track, newQueue?: Track[]) => void;
  playNext: () => void;
  playPrev: () => void;
}

const shuffleArray = (array: Track[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const usePlayer = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  queue: [],
  originalQueue: [],
  currentIndex: -1,
  isPlaying: false,
  volume: 1, // Để mặc định max volume
  isShuffle: false,
  repeatMode: "off",
  isQueueVisible: false,

  setPlayState: (state) => set({ isPlaying: state }),

  setVolume: (volume) => set({ volume }),

  togglePlay: () => {
    const { currentTrack, isPlaying } = get();
    if (currentTrack) set({ isPlaying: !isPlaying });
  },

  toggleQueue: () =>
    set((state) => ({ isQueueVisible: !state.isQueueVisible })),

  toggleRepeat: () => {
    const current = get().repeatMode;
    const next = current === "off" ? "all" : current === "all" ? "one" : "off";
    set({ repeatMode: next });
  },

  toggleShuffle: () => {
    const { isShuffle, originalQueue, currentTrack } = get();
    const newShuffleState = !isShuffle;

    if (newShuffleState) {
      if (!currentTrack) {
        set({ isShuffle: true });
        return;
      }
      const otherTracks = originalQueue.filter((t) => t.id !== currentTrack.id);
      const shuffledOthers = shuffleArray(otherTracks);
      const newQueue = [currentTrack, ...shuffledOthers];

      set({
        isShuffle: true,
        queue: newQueue,
        currentIndex: 0,
      });
    } else {
      const originalIndex = currentTrack
        ? originalQueue.findIndex((t) => t.id === currentTrack.id)
        : -1;
      set({
        isShuffle: false,
        queue: originalQueue,
        currentIndex: originalIndex,
      });
    }
  },

  playTrack: (track, newQueue) => {
    const { isShuffle, originalQueue } = get();
    const targetQueue = newQueue || originalQueue;

    if (isShuffle) {
      const otherTracks = targetQueue.filter((t) => t.id !== track.id);
      const shuffledOthers = shuffleArray(otherTracks);
      const finalQueue = [track, ...shuffledOthers];

      set({
        originalQueue: targetQueue,
        queue: finalQueue,
        currentTrack: track,
        currentIndex: 0,
        isPlaying: true,
      });
    } else {
      set({
        originalQueue: targetQueue,
        queue: targetQueue,
        currentTrack: track,
        currentIndex: targetQueue.findIndex((t) => t.id === track.id),
        isPlaying: true,
      });
    }
  },

  playNext: () => {
    const { queue, currentIndex, repeatMode } = get();
    if (queue.length === 0) return;

    if (currentIndex + 1 >= queue.length) {
      if (repeatMode === "all") {
        set({ currentTrack: queue[0], currentIndex: 0, isPlaying: true });
      } else {
        set({ isPlaying: false }); // Dừng phát khi hết danh sách
      }
    } else {
      const nextIndex = currentIndex + 1;
      set({
        currentTrack: queue[nextIndex],
        currentIndex: nextIndex,
        isPlaying: true,
      });
    }
  },

  playPrev: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return;

    const prevIndex =
      currentIndex - 1 < 0 ? queue.length - 1 : currentIndex - 1;
    set({
      currentTrack: queue[prevIndex],
      currentIndex: prevIndex,
      isPlaying: true,
    });
  },
}));

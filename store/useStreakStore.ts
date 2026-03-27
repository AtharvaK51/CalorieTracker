import { create } from 'zustand';
import { getCurrentStreak } from '../db/streaks';

interface StreakState {
  currentStreak: number;
  loadStreak: () => Promise<void>;
}

export const useStreakStore = create<StreakState>((set) => ({
  currentStreak: 0,

  loadStreak: async () => {
    const streak = await getCurrentStreak();
    set({ currentStreak: streak });
  },
}));

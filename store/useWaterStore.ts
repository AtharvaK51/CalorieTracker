import { create } from 'zustand';
import { addWater, removeLastWater, getWaterForDate } from '../db/water';
import { today } from '../utils/date';

interface WaterState {
  todayTotal: number;
  loadToday: () => Promise<void>;
  add: (amountMl: number) => Promise<void>;
  undoLast: () => Promise<void>;
}

export const useWaterStore = create<WaterState>((set) => ({
  todayTotal: 0,

  loadToday: async () => {
    const total = await getWaterForDate(today());
    set({ todayTotal: total });
  },

  add: async (amountMl) => {
    await addWater(amountMl);
    const total = await getWaterForDate(today());
    set({ todayTotal: total });
  },

  undoLast: async () => {
    await removeLastWater(today());
    const total = await getWaterForDate(today());
    set({ todayTotal: total });
  },
}));

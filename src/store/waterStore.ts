import { create } from 'zustand';

import { deleteWater, insertWater, listWater } from '@/db/health';
import { localDateString } from '@/logic/dates';
import type { WaterLog } from '@/types';

interface WaterState {
  date: string;
  logs: WaterLog[];
  totalMl: number;
  load: () => Promise<void>;
  add: (amountMl: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const sum = (logs: readonly WaterLog[]) => logs.reduce((total, log) => total + log.amountMl, 0);

/** Today's water. Rolls over to the new day on the next load or add. */
export const useWaterStore = create<WaterState>((set, get) => ({
  date: localDateString(),
  logs: [],
  totalMl: 0,

  load: async () => {
    const date = localDateString();
    const logs = await listWater(date);
    set({ date, logs, totalMl: sum(logs) });
  },

  add: async (amountMl) => {
    const today = localDateString();
    if (get().date !== today) await get().load();
    const log = await insertWater(amountMl, today, new Date().toISOString());
    const logs = [log, ...get().logs];
    set({ logs, totalMl: sum(logs) });
  },

  remove: async (id) => {
    await deleteWater(id);
    const logs = get().logs.filter((log) => log.id !== id);
    set({ logs, totalMl: sum(logs) });
  },
}));

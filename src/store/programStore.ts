import { create } from 'zustand';

import { SESSIONS_PER_PROGRAM } from '@/data/programs';
import { insertCompletion, listCompletions } from '@/db/health';
import type { WorkoutCompletion } from '@/types';

interface ProgramState {
  completions: WorkoutCompletion[];
  load: () => Promise<void>;
  complete: (programId: string, sessionIndex: number, activityId: string | null) => Promise<void>;
}

export const useProgramStore = create<ProgramState>((set, get) => ({
  completions: [],

  load: async () => {
    set({ completions: await listCompletions() });
  },

  complete: async (programId, sessionIndex, activityId) => {
    const completion = await insertCompletion(programId, sessionIndex, activityId);
    set({ completions: [...get().completions, completion] });
  },
}));

export function completedSessions(
  completions: readonly WorkoutCompletion[],
  programId: string,
): Set<number> {
  return new Set(
    completions
      .filter((completion) => completion.programId === programId)
      .map((completion) => completion.sessionIndex),
  );
}

/** The first session not yet done, or null when the program is finished. */
export function nextSessionIndex(
  completions: readonly WorkoutCompletion[],
  programId: string,
): number | null {
  const done = completedSessions(completions, programId);
  for (let index = 0; index < SESSIONS_PER_PROGRAM; index += 1) {
    if (!done.has(index)) return index;
  }
  return null;
}

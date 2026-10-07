import { create } from 'zustand';

import { getProfile, saveProfile } from '@/db/queries';
import { applyProfileEdit } from '@/logic/targets';
import type { Profile } from '@/types';

type Status = 'idle' | 'loading' | 'ready';

interface ProfileState {
  status: Status;
  profile: Profile | null;
  load: () => Promise<void>;
  /** Writes a complete profile — the end of onboarding. */
  save: (profile: Profile) => Promise<void>;
  /** Applies an edit and recomputes the targets that depend on it. */
  update: (patch: Partial<Profile>) => Promise<void>;
  clear: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  status: 'idle',
  profile: null,

  load: async () => {
    set({ status: 'loading' });
    try {
      set({ profile: await getProfile(), status: 'ready' });
    } catch (error) {
      set({ status: 'ready' });
      throw error;
    }
  },

  save: async (profile) => {
    await saveProfile(profile);
    set({ profile, status: 'ready' });
  },

  update: async (patch) => {
    const current = get().profile;
    if (!current) return;
    const next = applyProfileEdit(current, patch);
    await saveProfile(next);
    set({ profile: next });
  },

  clear: () => set({ profile: null, status: 'ready' }),
}));

/** A profile counts as onboarded once it has a name (v1 profiles have none). */
export function isOnboarded(profile: Profile | null): profile is Profile {
  return profile !== null && profile.name.trim().length > 0;
}

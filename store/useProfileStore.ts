import { create } from 'zustand';
import {
  getProfile,
  updateProfile as dbUpdateProfile,
  type UserProfile,
} from '../db/profile';
import { Config } from '../constants/config';

interface ProfileState {
  profile: UserProfile | null;
  loaded: boolean;
  loadProfile: () => Promise<void>;
  updateProfile: (
    data: Partial<Omit<UserProfile, 'id' | 'created_at'>>
  ) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loaded: false,

  loadProfile: async () => {
    const profile = await getProfile();
    set({ profile, loaded: true });
  },

  updateProfile: async (data) => {
    await dbUpdateProfile(data);
    const profile = await getProfile();
    set({ profile });
  },
}));

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { UserData } from '@/services/auth';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserData | null;
  isAuthenticated: boolean;
  login: (userData: UserData, accessToken: string, refreshToken: string) => void;
  refresh: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  register: (userData: UserData, accessToken: string, refreshToken: string) => void;
  updateProfile: (userData: UserData) => void;
};

const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      login: (userData: UserData, accessToken: string, refreshToken: string) => {
        set({ 
          accessToken, 
          refreshToken,
          user: userData, 
          isAuthenticated: true 
        });
      },

      refresh: (accessToken: string, refreshToken: string) => {
        set({ 
          accessToken, 
          refreshToken
        });
      },

      logout: () => {
        set({ 
          accessToken: null, 
          refreshToken: null,
          user: null, 
          isAuthenticated: false 
        });
      },

      register: (userData: UserData, accessToken: string, refreshToken: string) => {
        set({ 
          accessToken, 
          refreshToken,
          user: userData, 
          isAuthenticated: true 
        });
      },

      updateProfile: (userData: UserData) => {
        set({
          user: userData
        })
      }
    }),
    {
      name: 'auth-storage', 
      storage: createJSONStorage(() => secureStorage),
    }
  )
);

export default useAuthStore;
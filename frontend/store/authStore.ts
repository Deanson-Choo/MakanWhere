import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserData } from '@/services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthState = {
    token: string | null;
    user: UserData | null;
    isAuthenticated: boolean;
    login: (userData: UserData, token: string) => void;
    logout: () => void;
    signup: (userData: UserData, token: string) => void;
    updateProfile: (userData: UserData) => void;
};

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (userData: UserData, token: string) => {
        set({ 
          token, 
          user: userData, 
          isAuthenticated: true 
        });
      },

      logout: () => {
        set({ 
          token: null, 
          user: null, 
          isAuthenticated: false 
        });
      },

      signup: (userData: UserData, token: string) => {
        set({ 
          token, 
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
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useAuthStore;
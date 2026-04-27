import { create } from 'zustand';
import storage from '../utils/storage';
import { UserRole } from '../types';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  role: UserRole | null;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signIn: (token: string, refreshToken: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  role: null,
  isLoading: true,
  initialize: async () => {
    const storedToken = await storage.getToken();
    const storedRefreshToken = await storage.getRefreshToken();
    const storedRole = await storage.getRole();
    set({ 
      token: storedToken, 
      refreshToken: storedRefreshToken, 
      role: storedRole as UserRole | null, 
      isLoading: false 
    });
  },
  signIn: async (token: string, refreshToken: string, role: UserRole) => {
    await storage.setToken(token);
    await storage.setRefreshToken(refreshToken);
    await storage.setRole(role);
    set({ token, refreshToken, role });
  },
  signOut: async () => {
    await storage.removeToken();
    await storage.removeRefreshToken();
    await storage.removeRole();
    set({ token: null, refreshToken: null, role: null });
  }
}));


export default useAuthStore;

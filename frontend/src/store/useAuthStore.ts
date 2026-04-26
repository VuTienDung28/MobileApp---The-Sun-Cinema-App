import { create } from 'zustand';
import storage from '../utils/storage';
import { UserRole } from '../types';

interface AuthState {
  token: string | null;
  role: UserRole | null;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signIn: (token: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  token: null,
  role: null,
  isLoading: true,
  initialize: async () => {
    const storedToken = await storage.getToken();
    const storedRole = await storage.getRole();
    set({ token: storedToken, role: storedRole as UserRole | null, isLoading: false });
  },
  signIn: async (token: string, role: UserRole) => {
    await storage.setToken(token);
    await storage.setRole(role);
    set({ token, role });
  },
  signOut: async () => {
    await storage.removeToken();
    await storage.removeRole();
    set({ token: null, role: null });
  }
}));

export default useAuthStore;

import { create } from 'zustand';
import storage from '../utils/storage';

const useAuthStore = create((set) => ({
  token: null,
  role: null,
  isLoading: true,

  initialize: async () => {
    const storedToken = await storage.getToken();
    const storedRole = await storage.getRole();
    set({ token: storedToken, role: storedRole, isLoading: false });
  },

  signIn: async (token, role) => {
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

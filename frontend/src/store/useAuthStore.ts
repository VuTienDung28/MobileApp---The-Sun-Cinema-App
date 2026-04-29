import { create } from 'zustand';
import storage from '../utils/storage';
import { UserRole } from '../types';
import userService from '../services/userService';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  role: UserRole | null;
  fullName: string | null;
  avatarUrl: string | null;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signIn: (token: string, refreshToken: string, role: UserRole, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  setFullName: (name: string) => void;
  setAvatarUrl: (url: string | null) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  token: null,
  refreshToken: null,
  role: null,
  fullName: null,
  avatarUrl: null,
  isLoading: true,

  initialize: async () => {
    const storedToken = await storage.getToken();
    const storedRefreshToken = await storage.getRefreshToken();
    const storedRole = await storage.getRole();

    // Lấy fullName từ storage trước
    let fullName = await storage.getFullName();
    let avatarUrl: string | null = null;

    // Nếu có token → gọi API để lấy profile đầy đủ (bao gồm avatarUrl)
    if (storedToken) {
      try {
        const profile = await userService.getProfile();
        if (profile.fullName) fullName = profile.fullName;
        avatarUrl = profile.avatarUrl ?? null;
        // Lưu fullName lại để lần sau không cần gọi API
        if (fullName) await storage.setFullName(fullName);
      } catch {
        // Không cần xử lý lỗi — dùng giá trị từ storage nếu có
      }
    }

    set({
      token: storedToken,
      refreshToken: storedRefreshToken,
      role: storedRole as UserRole | null,
      fullName,
      avatarUrl,
      isLoading: false,
    });
  },

  signIn: async (token: string, refreshToken: string, role: UserRole, fullName: string) => {
    await storage.setToken(token);
    await storage.setRefreshToken(refreshToken);
    await storage.setRole(role);
    await storage.setFullName(fullName);
    set({ token, refreshToken, role, fullName, avatarUrl: null });
  },

  signOut: async () => {
    await storage.removeToken();
    await storage.removeRefreshToken();
    await storage.removeRole();
    await storage.removeFullName();
    set({ token: null, refreshToken: null, role: null, fullName: null, avatarUrl: null });
  },

  /** Cập nhật fullName trong store (gọi sau khi updateProfile thành công) */
  setFullName: (name: string) => {
    set({ fullName: name });
    storage.setFullName(name);
  },

  /** Cập nhật avatarUrl trong store (gọi sau khi updateAvatar thành công) */
  setAvatarUrl: (url: string | null) => {
    set({ avatarUrl: url });
  },
}));


export default useAuthStore;

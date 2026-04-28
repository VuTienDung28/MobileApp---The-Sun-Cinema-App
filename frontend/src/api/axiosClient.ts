import axios from 'axios';
import storage from '../utils/storage';
import useAuthStore from '../store/useAuthStore';

const axiosClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa được thử lại
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const currentToken = await storage.getToken();
        const refreshToken = await storage.getRefreshToken();

        if (!currentToken || !refreshToken) {
          throw new Error('No tokens available');
        }

        // Gọi API refresh token
        // Lưu ý: Phải dùng axios gốc để tránh interceptor này lặp vô tận
        const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`, {
          accessToken: currentToken,
          refreshToken: refreshToken
        });

        if (response.data?.isSuccess) {
          const { token: newToken, refreshToken: newRefreshToken, roles } = response.data.data;
          
          // Cập nhật vào store và storage
          const role = roles.includes('Admin') ? 'Admin' : 'User';
          await useAuthStore.getState().signIn(newToken, newRefreshToken, role as any);

          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.warn('Refresh token failed - signing out');
        useAuthStore.getState().signOut();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    throw error.response?.data || error;
  }
);

export default axiosClient;
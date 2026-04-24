import axios from 'axios';
import storage from '../utils/storage';
import useAuthStore from '../store/useAuthStore';

const axiosClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  (error) => {
    // Bắt lỗi toàn cục
    if (error.response?.status === 401) {
      console.warn('Unauthorized - Token hết hạn, tự động đăng xuất');
      useAuthStore.getState().signOut();
    }
    throw error.response?.data || error;
  }
);

export default axiosClient;

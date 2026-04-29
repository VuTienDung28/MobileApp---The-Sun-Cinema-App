import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const storage = {
  getToken: async (): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return sessionStorage.getItem('userToken');
      }
      return await SecureStore.getItemAsync('userToken');
    } catch (e) {
      return null;
    }
  },
  setToken: async (token: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        sessionStorage.setItem('userToken', token);
      } else {
        await SecureStore.setItemAsync('userToken', token);
      }
    } catch (e) {
      console.error('Error saving token', e);
    }
  },
  removeToken: async (): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        sessionStorage.removeItem('userToken');
      } else {
        await SecureStore.deleteItemAsync('userToken');
      }
    } catch (e) {
      console.error('Error removing token', e);
    }
  },
  getRole: async (): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return sessionStorage.getItem('userRole');
      }
      return await SecureStore.getItemAsync('userRole');
    } catch (e) {
      return null;
    }
  },
  setRole: async (role: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        sessionStorage.setItem('userRole', role);
      } else {
        await SecureStore.setItemAsync('userRole', role);
      }
    } catch (e) {
      console.error('Error saving role', e);
    }
  },
  removeRole: async (): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        sessionStorage.removeItem('userRole');
      } else {
        await SecureStore.deleteItemAsync('userRole');
      }
    } catch (e) {
      console.error('Error removing role', e);
    }
  },
  getRefreshToken: async (): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return sessionStorage.getItem('refreshToken');
      }
      return await SecureStore.getItemAsync('refreshToken');
    } catch (e) {
      return null;
    }
  },
  setRefreshToken: async (token: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        sessionStorage.setItem('refreshToken', token);
      } else {
        await SecureStore.setItemAsync('refreshToken', token);
      }
    } catch (e) {
      console.error('Error saving refresh token', e);
    }
  },
  removeRefreshToken: async (): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        sessionStorage.removeItem('refreshToken');
      } else {
        await SecureStore.deleteItemAsync('refreshToken');
      }
    } catch (e) {
      console.error('Error removing refresh token', e);
    }
  },
  getFullName: async (): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return sessionStorage.getItem('userFullName');
      }
      return await SecureStore.getItemAsync('userFullName');
    } catch (e) {
      return null;
    }
  },
  setFullName: async (fullName: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        sessionStorage.setItem('userFullName', fullName);
      } else {
        await SecureStore.setItemAsync('userFullName', fullName);
      }
    } catch (e) {
      console.error('Error saving fullName', e);
    }
  },
  removeFullName: async (): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        sessionStorage.removeItem('userFullName');
      } else {
        await SecureStore.deleteItemAsync('userFullName');
      }
    } catch (e) {
      console.error('Error removing fullName', e);
    }
  },
};


export default storage;
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const storage = {
  getToken: async (): Promise<string | null> => {
    try {
      if (Platform.OS === 'web') {
        return sessionStorage.getItem('userToken');
      }
      return await AsyncStorage.getItem('userToken');
    } catch (e) {
      return null;
    }
  },
  setToken: async (token: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        sessionStorage.setItem('userToken', token);
      } else {
        await AsyncStorage.setItem('userToken', token);
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
        await AsyncStorage.removeItem('userToken');
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
      return await AsyncStorage.getItem('userRole');
    } catch (e) {
      return null;
    }
  },
  setRole: async (role: string): Promise<void> => {
    try {
      if (Platform.OS === 'web') {
        sessionStorage.setItem('userRole', role);
      } else {
        await AsyncStorage.setItem('userRole', role);
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
        await AsyncStorage.removeItem('userRole');
      }
    } catch (e) {
      console.error('Error removing role', e);
    }
  }
};

export default storage;
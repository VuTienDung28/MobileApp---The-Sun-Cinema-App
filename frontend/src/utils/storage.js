import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const storage = {
  getToken: async () => {
    try {
      if (Platform.OS === 'web') {
        return sessionStorage.getItem('userToken');
      }
      return await AsyncStorage.getItem('userToken');
    } catch (e) {
      return null;
    }
  },
  setToken: async (token) => {
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
  removeToken: async () => {
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
  getRole: async () => {
    try {
      if (Platform.OS === 'web') {
        return sessionStorage.getItem('userRole');
      }
      return await AsyncStorage.getItem('userRole');
    } catch (e) {
      return null;
    }
  },
  setRole: async (role) => {
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
  removeRole: async () => {
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

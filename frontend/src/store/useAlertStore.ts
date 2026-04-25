import { create } from 'zustand';
import { AlertType, AlertButton, AlertOptions } from '../types';

interface AlertState {
  isVisible: boolean;
  title: string;
  message: string;
  type: AlertType;
  buttons: AlertButton[];
  showAlert: (title: string, message: string, options?: AlertOptions) => void;
  hideAlert: () => void;
}

const useAlertStore = create<AlertState>((set) => ({
  isVisible: false,
  title: '',
  message: '',
  type: 'info',
  buttons: [],
  showAlert: (title: string, message: string, options: AlertOptions = {}) => {
    set({
      isVisible: true,
      title,
      message,
      type: options.type || 'info',
      buttons: options.buttons || [{ text: 'OK', onPress: () => {} }]
    });
  },
  hideAlert: () => {
    set({ isVisible: false });
  }
}));

export default useAlertStore;
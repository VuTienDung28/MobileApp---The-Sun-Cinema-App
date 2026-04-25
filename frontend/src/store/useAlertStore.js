import { create } from 'zustand';
const useAlertStore = create((set) => ({
  isVisible: false,
  title: '',
  message: '',
  type: 'info', // 'success', 'error', 'warning', 'info'
  buttons: [],
  showAlert: (title, message, options = {}) => {
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
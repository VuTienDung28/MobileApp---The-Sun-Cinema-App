import axiosClient from '../api/axiosClient';
const authService = {
  login: async (email, password) => {
    return await axiosClient.post('/auth/login', { email, password });
  },
  register: async (userData) => {
    return await axiosClient.post('/auth/register', userData);
  }
};
export default authService;
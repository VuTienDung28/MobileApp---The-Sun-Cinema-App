import axiosClient from '../api/axiosClient';
import { LoginRequest, RegisterRequest, ApiResponse, AuthResponseData } from '../types';

const authService = {
  login: async (email: string, password: string): Promise<ApiResponse<AuthResponseData>> => {
    return await axiosClient.post('/auth/login', { email, password } as LoginRequest);
  },
  refresh: async (accessToken: string, refreshToken: string): Promise<ApiResponse<AuthResponseData>> => {
    return await axiosClient.post('/auth/refresh', { accessToken, refreshToken });
  },
  register: async (userData: RegisterRequest): Promise<ApiResponse<null>> => {

    return await axiosClient.post('/auth/register', userData);
  }
};

export default authService;
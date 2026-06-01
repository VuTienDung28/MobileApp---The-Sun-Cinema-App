import axiosClient from '../api/axiosClient';
import { LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest, ApiResponse, AuthResponseData } from '../types';

const authService = {
  login: async (email: string, password: string): Promise<ApiResponse<AuthResponseData>> => {
    return await axiosClient.post('/auth/login', { email, password } as LoginRequest);
  },
  refresh: async (accessToken: string, refreshToken: string): Promise<ApiResponse<AuthResponseData>> => {
    return await axiosClient.post('/auth/refresh', { accessToken, refreshToken });
  },
  register: async (userData: RegisterRequest): Promise<ApiResponse<null>> => {

    return await axiosClient.post('/auth/register', userData);
  },
  forgotPassword: async (email: string): Promise<ApiResponse<string>> => {
    return await axiosClient.post('/auth/forgot-password', { email } as ForgotPasswordRequest);
  },
  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse<string>> => {
    return await axiosClient.post('/auth/reset-password', data);
  }
};

export default authService;
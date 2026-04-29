import axiosClient from '../api/axiosClient';
import { Platform } from 'react-native';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;  // ISO string, e.g. "1999-05-21T00:00:00"
  gender?: string;
  province?: string;
  district?: string;
  avatarUrl?: string;    // Relative path, e.g. /avatar-images/user123.jpg
}

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  province?: string;
  district?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateAvatarResponse {
  avatarRelativePath: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

const userService = {
  /**
   * GET /api/user/profile
   * axiosClient interceptor đã unwrap: response trả về = { isSuccess, data, message }
   * nên chỉ cần .data để lấy UserProfileResponseDto
   */
  getProfile: async (): Promise<UserProfile> => {
    const response: any = await axiosClient.get('/user/profile');
    return response.data;
  },

  /** PUT /api/user/profile — Cập nhật thông tin cá nhân */
  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response: any = await axiosClient.put('/user/profile', data);
    return response.data;
  },

  /** PUT /api/user/change-password — Đổi mật khẩu */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await axiosClient.put('/user/change-password', data);
  },

  /**
   * PUT /api/user/avatar — Upload ảnh đại diện (multipart/form-data)
   * Hỗ trợ cả React Native (uri) và Expo Web (fetch blob)
   */
  updateAvatar: async (fileUri: string, fileName: string, mimeType: string): Promise<UpdateAvatarResponse> => {
    const formData = new FormData();

    // Đảm bảo fileName luôn có extension — Backend kiểm tra file.FileName để validate
    const extMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };
    const ext = extMap[mimeType] ?? '.jpg';
    
    // Đảm bảo safeFileName chỉ là tên file, không chứa đường dẫn hay URI
    // and check extension
    const baseName = fileName.split('/').pop()?.split('?')[0] || 'avatar';
    const hasExt = /\.(jpg|jpeg|png|webp)$/i.test(baseName);
    const safeFileName = hasExt ? baseName : `${baseName}${ext}`;

    if (Platform.OS === 'web') {
      // Trên web: blob URI → fetch → Blob với explicit type
      const blobRes = await fetch(fileUri);
      const rawBlob = await blobRes.blob();
      // Tạo Blob mới với MIME type rõ ràng để đảm bảo Content-Type đúng
      const typedBlob = new Blob([rawBlob], { type: mimeType || 'image/jpeg' });
      formData.append('file', typedBlob, safeFileName);
    } else {
      // Trên native: object với uri
      formData.append('file', {
        uri: fileUri,
        name: safeFileName,
        type: mimeType || 'image/jpeg',
      } as any);
    }

    const response: any = await axiosClient.put('/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default userService;

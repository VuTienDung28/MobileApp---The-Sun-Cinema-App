using backend.DTOs;
using Microsoft.AspNetCore.Http;

namespace backend.Services.Interface
{
    public interface IUserService
    {
        /// <summary>Lấy thông tin cá nhân người dùng</summary>
        Task<UserProfileResponseDto> GetProfileAsync(string userId);

        /// <summary>Cập nhật thông tin cá nhân người dùng</summary>
        Task<UserProfileResponseDto> UpdateProfileAsync(string userId, UpdateProfileDto dto);

        /// <summary>Thay đổi mật khẩu người dùng</summary>
        Task ChangePasswordAsync(string userId, ChangePasswordDto dto);

        /// <summary>Upload ảnh đại diện lên MinIO, lưu relative path vào DB</summary>
        Task<UpdateAvatarResponseDto> UpdateAvatarAsync(string userId, IFormFile file);
    }
}
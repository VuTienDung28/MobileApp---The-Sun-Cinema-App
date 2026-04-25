using backend.DTOs;
using backend.Exceptions;
using backend.Models;
using backend.Repositories.Interface;
using backend.Services.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
namespace backend.Services.Implements
{
    public class UserService : IUserService
    {
        private readonly IUserRepository  _userRepository;
        private readonly IStorageService  _storageService;
        private readonly MinIOOptions     _minioOptions;
        public UserService(
            IUserRepository userRepository,
            IStorageService storageService,
            IOptions<MinIOOptions> minioOptions)
        {
            _userRepository = userRepository;
            _storageService = storageService;
            _minioOptions   = minioOptions.Value;
        }
        // =============================================
        // GET /api/user/profile
        // =============================================
        public async Task<UserProfileResponseDto> GetProfileAsync(string userId)
        {
            var user = await _userRepository.FindByIdAsync(userId)
                ?? throw new UserFriendlyException("Không tìm thấy người dùng.", "USER_NOT_FOUND");
            return MapToProfileResponse(user);
        }
        // =============================================
        // PUT /api/user/profile
        // =============================================
        public async Task<UserProfileResponseDto> UpdateProfileAsync(string userId, UpdateProfileDto dto)
        {
            var user = await _userRepository.FindByIdAsync(userId)
                ?? throw new UserFriendlyException("Không tìm thấy người dùng.", "USER_NOT_FOUND");
            // Cập nhật các trường thông tin
            user.FullName    = dto.FullName;
            user.PhoneNumber = dto.PhoneNumber;
            user.DateOfBirth = dto.DateOfBirth;
            user.Gender      = dto.Gender;
            user.Province    = dto.Province;
            user.District    = dto.District;
            var result = await _userRepository.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                throw new UserFriendlyException($"Cập nhật thông tin thất bại: {errors}", "UPDATE_PROFILE_FAILED");
            }
            return MapToProfileResponse(user);
        }
        // =============================================
        // PUT /api/user/change-password
        // =============================================
        public async Task ChangePasswordAsync(string userId, ChangePasswordDto dto)
        {
            // Validate ConfirmNewPassword khớp NewPassword
            if (dto.NewPassword != dto.ConfirmNewPassword)
            {
                throw new UserFriendlyException("Mật khẩu xác nhận không khớp với mật khẩu mới.", "PASSWORD_MISMATCH");
            }
            // Không cho phép đặt mật khẩu mới giống mật khẩu cũ
            if (dto.CurrentPassword == dto.NewPassword)
            {
                throw new UserFriendlyException("Mật khẩu mới không được trùng với mật khẩu hiện tại.", "SAME_PASSWORD");
            }
            var user = await _userRepository.FindByIdAsync(userId)
                ?? throw new UserFriendlyException("Không tìm thấy người dùng.", "USER_NOT_FOUND");
            var result = await _userRepository.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
            if (!result.Succeeded)
            {
                // Identity thường trả "Incorrect password." khi sai mật khẩu hiện tại
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                throw new UserFriendlyException($"Đổi mật khẩu thất bại: {errors}", "CHANGE_PASSWORD_FAILED");
            }
        }
        // =============================================
        // PUT /api/user/avatar
        // =============================================
        public async Task<UpdateAvatarResponseDto> UpdateAvatarAsync(string userId, IFormFile file)
        {
            var user = await _userRepository.FindByIdAsync(userId)
                ?? throw new UserFriendlyException("Không tìm thấy người dùng.", "USER_NOT_FOUND");
            // Tạo object key duy nhất: userId_timestamp.jpg
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var objectKey = $"{userId}_{timestamp}.jpg";
            // Xóa avatar cũ nếu đã có
            if (!string.IsNullOrEmpty(user.AvatarUrl))
            {
                await _storageService.DeleteAsync(user.AvatarUrl);
            }
            // Upload ảnh mới → nhận relative path
            var relativePath = await _storageService.UploadAsync(file, _minioOptions.AvatarBucketName, objectKey);
            // Lưu relative path vào DB
            user.AvatarUrl = relativePath;
            var result = await _userRepository.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                throw new UserFriendlyException($"Lưu ảnh đại diện thất bại: {errors}", "UPDATE_AVATAR_FAILED");
            }
            return new UpdateAvatarResponseDto { AvatarRelativePath = relativePath };
        }
        // =============================================
        // Helper: Map ApplicationUser → DTO
        // =============================================
        private static UserProfileResponseDto MapToProfileResponse(ApplicationUser user)
        {
            return new UserProfileResponseDto
            {
                Id          = user.Id,
                FullName    = user.FullName,
                Email       = user.Email ?? string.Empty,
                PhoneNumber = user.PhoneNumber,
                DateOfBirth = user.DateOfBirth,
                Gender      = user.Gender,
                Province    = user.Province,
                District    = user.District,
                AvatarUrl   = user.AvatarUrl
            };
        }
    }
}

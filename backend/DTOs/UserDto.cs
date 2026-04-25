using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace backend.DTOs
{
    /// <summary>
    /// DTO trả về thông tin profile người dùng
    /// </summary>
    public class UserProfileResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Province { get; set; }
        public string? District { get; set; }

        /// <summary>Đường dẫn tương đối ảnh đại diện. Frontend tự ghép với MinIO base URL để hiển thị.</summary>
        public string? AvatarUrl { get; set; }
    }

    /// <summary>
    /// DTO cập nhật thông tin cá nhân
    /// </summary>
    public class UpdateProfileDto
    {
        [Required(ErrorMessage = "Họ tên không được để trống")]
        public string FullName { get; set; } = string.Empty;

        [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
        public string? PhoneNumber { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public string? Gender { get; set; }

        public string? Province { get; set; }

        public string? District { get; set; }
    }

    /// <summary>
    /// DTO đổi mật khẩu
    /// </summary>
    public class ChangePasswordDto
    {
        [Required(ErrorMessage = "Mật khẩu hiện tại không được để trống")]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mật khẩu mới không được để trống")]
        [MinLength(6, ErrorMessage = "Mật khẩu mới phải có ít nhất 6 ký tự")]
        public string NewPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "Xác nhận mật khẩu không được để trống")]
        public string ConfirmNewPassword { get; set; } = string.Empty;
    }
     /// DTO request upload avatar — bọc IFormFile để Swagger generate đúng schema
    /// </summary>
    public class UploadAvatarRequestDto
    {
        [Required(ErrorMessage = "Vui lòng chọn file ảnh.")]
        public IFormFile File { get; set; } = null!;
    }

    /// <summary>
    /// DTO trả về sau khi upload avatar thành công
    /// </summary>
    public class UpdateAvatarResponseDto
    {
        /// <summary>Đường dẫn tương đối. VD: /avatar-images/user123_1714000000.jpg</summary>
        public string AvatarRelativePath { get; set; } = string.Empty;
    }
}

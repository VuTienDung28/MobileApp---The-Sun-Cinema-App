using backend.DTOs;
using backend.Exceptions;
using backend.Models;
using backend.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("api/user")]
[Authorize(Policy = "UserOnly")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// Lấy userId từ JWT token hiện tại
    /// </summary>
    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UserFriendlyException("Không xác định được người dùng.", "UNAUTHORIZED");
    }

    // =============================================
    // GET /api/user/profile
    // Lấy thông tin cá nhân của user đang đăng nhập
    // =============================================
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        try
        {
            var userId = GetCurrentUserId();
            var profile = await _userService.GetProfileAsync(userId);
            return Ok(ApiResponse<UserProfileResponseDto>.Success(profile, "Lấy thông tin thành công", "GET_PROFILE_SUCCESS"));
        }
        catch (UserFriendlyException ex)
        {
            return BadRequest(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Failure("SERVER_ERROR", "Lỗi hệ thống khi lấy thông tin.", ex.Message));
        }
    }

    // =============================================
    // PUT /api/user/profile
    // Cập nhật thông tin cá nhân của user đang đăng nhập
    // =============================================
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto updateProfileDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            var updatedProfile = await _userService.UpdateProfileAsync(userId, updateProfileDto);
            return Ok(ApiResponse<UserProfileResponseDto>.Success(updatedProfile, "Cập nhật thông tin thành công", "UPDATE_PROFILE_SUCCESS"));
        }
        catch (UserFriendlyException ex)
        {
            return BadRequest(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Failure("SERVER_ERROR", "Lỗi hệ thống khi cập nhật thông tin.", ex.Message));
        }
    }

    // =============================================
    // PUT /api/user/change-password
    // Thay đổi mật khẩu của user đang đăng nhập
    // =============================================
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
    {
        try
        {
            var userId = GetCurrentUserId();
            await _userService.ChangePasswordAsync(userId, changePasswordDto);
            return Ok(ApiResponse<string>.Success(null, "Đổi mật khẩu thành công", "CHANGE_PASSWORD_SUCCESS"));
        }
        catch (UserFriendlyException ex)
        {
            return BadRequest(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Failure("SERVER_ERROR", "Lỗi hệ thống khi đổi mật khẩu.", ex.Message));
        }
    }
}
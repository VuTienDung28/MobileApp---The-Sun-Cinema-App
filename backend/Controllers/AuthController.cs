using backend.DTOs;
using backend.Exceptions;
using backend.Models;
using backend.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        try
        {
            var result = await _authService.RegisterAsync(registerDto);
            return Ok(ApiResponse<string>.Success(null, result.Message, "REGISTER_SUCCESS"));
        }
        catch (UserFriendlyException ex)
        {
            return BadRequest(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Failure("SERVER_ERROR", "Lỗi hệ thống khi đăng ký.", ex.Message));
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        try
        {
            var result = await _authService.LoginAsync(loginDto);
            var responseData = new { Token = result.Token, RefreshToken = result.RefreshToken, FullName = result.FullName, Roles = result.Roles };
            return Ok(ApiResponse<object>.Success(responseData, result.Message, "LOGIN_SUCCESS"));
        }
        catch (UserFriendlyException ex)
        {
            return BadRequest(ApiResponse<object>.Failure(ex.ErrorCode, ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.Failure("SERVER_ERROR", "Lỗi hệ thống khi đăng nhập.", ex.Message));
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] TokenRequestDto tokenRequestDto)
    {
        try
        {
            var result = await _authService.RefreshTokenAsync(tokenRequestDto);
            var responseData = new { Token = result.Token, RefreshToken = result.RefreshToken, Roles = result.Roles };
            return Ok(ApiResponse<object>.Success(responseData, "Làm mới token thành công", "REFRESH_SUCCESS"));
        }
        catch (UserFriendlyException ex)
        {
            return BadRequest(ApiResponse<object>.Failure(ex.ErrorCode, ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<object>.Failure("SERVER_ERROR", "Lỗi hệ thống khi làm mới token.", ex.Message));
        }
    }


    [Authorize(Policy = "AdminOnly")]
    [HttpGet("admin-test")]
    public IActionResult AdminTest()
    {
        return Ok(ApiResponse<string>.Success(null, "Bạn là Admin"));
    }

    [Authorize(Policy = "UserOnly")]
    [HttpGet("user-test")]
    public IActionResult UserTest()
    {
        if(User.IsInRole("Admin")){
            return Ok(ApiResponse<string>.Success(null, "Bạn là Admin"));
        }
        return Ok(ApiResponse<string>.Success(null, "Bạn là User"));
    }
}
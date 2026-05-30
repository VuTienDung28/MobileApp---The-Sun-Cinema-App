using backend.DTOs;
using backend.Exceptions;
using backend.Models;
using backend.Repositories.Interface;
using backend.Services.Interface;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace backend.Services.Implements
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly JwtOptions _jwtOptions;
        private readonly IEmailService _emailService;
        private readonly IMemoryCache _memoryCache;
        // Prefix key để tránh xung đột với cache khác
        private const string OtpCachePrefix = "ForgotPwd_OTP_";

        public AuthService(
            IUserRepository userRepository,
            IOptions<JwtOptions> jwtOptions,
            IEmailService emailService,
            IMemoryCache memoryCache)
        {
            _userRepository = userRepository;
            _jwtOptions = jwtOptions.Value;
            _emailService = emailService;
            _memoryCache = memoryCache;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            var user = new ApplicationUser
            {
                UserName = registerDto.Email,
                Email = registerDto.Email,
                FullName = registerDto.FullName,
                PhoneNumber = registerDto.PhoneNumber,
                DateOfBirth = registerDto.DateOfBirth,
                Gender = registerDto.Gender,
                Province = registerDto.Province,
                District = registerDto.District
            };

            var result = await _userRepository.CreateAsync(user, registerDto.Password);

            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                throw new UserFriendlyException($"Đăng ký không thành công: {errors}", "REGISTER_FAILED");
            }

            // Mặc định gán role User
            await _userRepository.AddToRoleAsync(user, "User");

            return new AuthResponseDto
            {
                IsSuccess = true,
                Message = "Đăng ký thành công"
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _userRepository.FindByEmailAsync(loginDto.Email);
            
            if (user == null || !await _userRepository.CheckPasswordAsync(user, loginDto.Password))
            {
                throw new UserFriendlyException("Sai tài khoản hoặc mật khẩu", "LOGIN_FAILED");
            }

            var roles = await _userRepository.GetRolesAsync(user);
            var token = GenerateJwtToken(user, roles);
            var refreshToken = GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.Now.AddDays(7); // Refresh token có hạn 7 ngày
            await _userRepository.UpdateAsync(user);

            return new AuthResponseDto
            {
                IsSuccess = true,
                Message = "Đăng nhập thành công",
                Token = token,
                RefreshToken = refreshToken,
                FullName = user.FullName,
                Roles = roles
            };
        }

        public async Task<AuthResponseDto> RefreshTokenAsync(TokenRequestDto tokenRequestDto)
        {
            var principal = GetPrincipalFromExpiredToken(tokenRequestDto.AccessToken);
            var email = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;

            if (email == null)
            {
                throw new UserFriendlyException("Token không hợp lệ", "INVALID_TOKEN");
            }

            var user = await _userRepository.FindByEmailAsync(email);

            if (user == null || user.RefreshToken != tokenRequestDto.RefreshToken || user.RefreshTokenExpiryTime <= DateTime.Now)
            {
                throw new UserFriendlyException("Refresh token không hợp lệ hoặc đã hết hạn", "INVALID_REFRESH_TOKEN");
            }

            var roles = await _userRepository.GetRolesAsync(user);
            var newAccessToken = GenerateJwtToken(user, roles);
            var newRefreshToken = GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            await _userRepository.UpdateAsync(user);

            return new AuthResponseDto
            {
                IsSuccess = true,
                Token = newAccessToken,
                RefreshToken = newRefreshToken,
                Roles = roles
            };
        }

        private string GenerateJwtToken(ApplicationUser user, IList<string> roles)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName!),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim("fullName", user.FullName ?? string.Empty)
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Key));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddMinutes(15), // Access token giảm xuống 15 phút để test refresh
                Issuer = _jwtOptions.Issuer,
                Audience = _jwtOptions.Audience,
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = false,
                ValidateIssuer = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Key)),
                ValidateLifetime = false // Quan trọng: không check hạn ở đây vì mình đang refresh từ token đã hết hạn
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);
            
            if (securityToken is not JwtSecurityToken jwtSecurityToken || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                throw new SecurityTokenException("Invalid token");

            return principal;
        }

        // ==========================================
        // QUÊN MẬT KHẨU – Bước 1: Gửi OTP qua email
        // ==========================================
        public async Task ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            var user = await _userRepository.FindByEmailAsync(dto.Email);

            // Luôn trả về thành công để tránh lộ thông tin tài khoản có tồn tại hay không
            if (user == null) return;

            // Tạo OTP 6 số ngẫu nhiên
            var otp = GenerateOtp();

            // Lưu OTP vào MemoryCache, hết hạn sau 10 phút
            var cacheKey = OtpCachePrefix + dto.Email.ToLowerInvariant();
            _memoryCache.Set(cacheKey, otp, TimeSpan.FromMinutes(10));

            // Xây dựng nội dung email HTML
            var htmlBody = BuildForgotPasswordEmail(user.FullName, otp);

            await _emailService.SendEmailAsync(
                toEmail: dto.Email,
                toName: user.FullName,
                subject: "[The Sun Cinema] Mã OTP đặt lại mật khẩu",
                htmlBody: htmlBody
            );
        }

        // ==========================================
        // QUÊN MẬT KHẨU – Bước 2: Xác minh OTP & đặt lại mật khẩu
        // ==========================================
        public async Task ResetPasswordAsync(ResetPasswordDto dto)
        {
            var cacheKey = OtpCachePrefix + dto.Email.ToLowerInvariant();

            if (!_memoryCache.TryGetValue(cacheKey, out string? cachedOtp) || cachedOtp != dto.Otp)
            {
                throw new UserFriendlyException("Mã OTP không hợp lệ hoặc đã hết hạn", "INVALID_OTP");
            }

            var user = await _userRepository.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                throw new UserFriendlyException("Tài khoản không tồn tại", "USER_NOT_FOUND");
            }

            // Dùng Identity để reset mật khẩu (tạo token nội bộ rồi dùng ngay)
            var resetToken = await _userRepository.GeneratePasswordResetTokenAsync(user);
            var result = await _userRepository.ResetPasswordAsync(user, resetToken, dto.NewPassword);

            if (!result.Succeeded)
            {
                var errors = string.Join("; ", result.Errors.Select(e => e.Description));
                throw new UserFriendlyException($"Đặt lại mật khẩu thất bại: {errors}", "RESET_FAILED");
            }

            // Xoá OTP khỏi cache sau khi dùng thành công
            _memoryCache.Remove(cacheKey);
        }

        // ------ Helpers ------

        private static string GenerateOtp()
        {
            using var rng = RandomNumberGenerator.Create();
            var bytes = new byte[4];
            rng.GetBytes(bytes);
            // Lấy số nguyên không âm rồi mod 1_000_000 để ra 6 chữ số
            var value = (BitConverter.ToUInt32(bytes, 0) % 1_000_000);
            return value.ToString("D6"); // Đảm bảo luôn đủ 6 chữ số
        }

        private static string BuildForgotPasswordEmail(string fullName, string otp)
        {
            return $"""
                <!DOCTYPE html>
                <html lang="vi">
                <head><meta charset="UTF-8"></head>
                <body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px">
                  <div style="max-width:480px;margin:auto;background:#fff;border-radius:10px;
                              padding:32px;box-shadow:0 2px 8px rgba(0,0,0,.08)">
                    <h2 style="color:#e84118;margin-top:0">🎬 The Sun Cinema</h2>
                    <p>Xin chào <strong>{fullName}</strong>,</p>
                    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
                    <p>Mã OTP của bạn là:</p>
                    <div style="text-align:center;margin:24px 0">
                      <span style="font-size:36px;font-weight:bold;letter-spacing:8px;
                                  color:#e84118;background:#fff5f5;padding:12px 24px;
                                  border-radius:8px;border:2px dashed #e84118">{otp}</span>
                    </div>
                    <p style="color:#666">⏳ Mã có hiệu lực trong <strong>10 phút</strong>.</p>
                    <p style="color:#666">Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
                    <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
                    <p style="font-size:12px;color:#999">© 2025 The Sun Cinema. All rights reserved.</p>
                  </div>
                </body>
                </html>
                """;
        }
    }
}

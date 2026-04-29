using backend.DTOs;
using backend.Exceptions;
using backend.Models;
using backend.Repositories.Interface;
using backend.Services.Interface;
using Microsoft.AspNetCore.Identity;
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

        public AuthService(IUserRepository userRepository, IOptions<JwtOptions> jwtOptions)
        {
            _userRepository = userRepository;
            _jwtOptions = jwtOptions.Value;
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
    }
}


using Microsoft.AspNetCore.Identity;
using backend.Models;

namespace backend.Repositories.Interface
{
    public interface IUserRepository
    {
        Task<ApplicationUser?> FindByEmailAsync(string email);
        Task<IdentityResult> CreateAsync(ApplicationUser user, string password);
        Task<bool> CheckPasswordAsync(ApplicationUser user, string password);
        Task<IList<string>> GetRolesAsync(ApplicationUser user);
        Task<IdentityResult> AddToRoleAsync(ApplicationUser user, string role);
        // ===== User Profile =====
        Task<ApplicationUser?> FindByIdAsync(string userId);
        Task<IdentityResult> UpdateAsync(ApplicationUser user);
        Task<IdentityResult> ChangePasswordAsync(ApplicationUser user, string currentPassword, string newPassword);
    }
}

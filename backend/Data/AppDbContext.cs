using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;
using backend.Models;

namespace backend.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // Khai báo các bảng nghiệp vụ của bạn
        //public DbSet<MediaFile> MediaFiles { get; set; }
        //public DbSet<Order> Orders { get; set; }
        //public DbSet<Payment> Payments { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            // Bắt buộc gọi base để EF Core cấu hình các bảng Identity trước
            base.OnModelCreating(builder);

            // 1. Mối quan hệ: IdentityUser (1) - Order (N)
            //builder.Entity<Order>()
            //    .HasOne(o => o.User)
            //    .WithMany() // Một User có thể có nhiều Order 
            //    .HasForeignKey(o => o.UserId)
            //    .OnDelete(DeleteBehavior.Cascade); // Xóa User -> Xóa luôn đơn hàng 

            //// 2. Mối quan hệ: Order (1) - Payment (1)
            //builder.Entity<Payment>()
            //    .HasOne(p => p.Order)
            //    .WithOne(o => o.Payment)
            //    .HasForeignKey<Payment>(p => p.OrderId)
            //    .OnDelete(DeleteBehavior.Cascade); // Xóa Order -> Xóa luôn bill thanh toán

            builder.Entity<ApplicationUser>().ToTable("Users");
            builder.Entity<IdentityRole>().ToTable("Roles");
            builder.Entity<IdentityUserRole<string>>().ToTable("UserRoles");
            builder.Entity<IdentityUserClaim<string>>().ToTable("UserClaims");
            builder.Entity<IdentityUserLogin<string>>().ToTable("UserLogins");
            builder.Entity<IdentityRoleClaim<string>>().ToTable("RoleClaims");
            builder.Entity<IdentityUserToken<string>>().ToTable("UserTokens");
        }
    }
}

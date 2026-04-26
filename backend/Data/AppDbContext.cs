using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Voucher> Vouchers { get; set; }
        public DbSet<Combo> Combos { get; set; }
        public DbSet<Movie> Movies { get; set; }
        public DbSet<Cinema> Cinemas { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<Seat> Seats { get; set; }
        public DbSet<Showtime> Showtimes { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<BookingCombo> BookingCombos { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Ticket> Tickets { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Rename Identity tables
            builder.Entity<ApplicationUser>().ToTable("Users");
            builder.Entity<IdentityRole>().ToTable("Roles");
            builder.Entity<IdentityUserRole<string>>().ToTable("UserRoles");
            builder.Entity<IdentityUserClaim<string>>().ToTable("UserClaims");
            builder.Entity<IdentityUserLogin<string>>().ToTable("UserLogins");
            builder.Entity<IdentityRoleClaim<string>>().ToTable("RoleClaims");
            builder.Entity<IdentityUserToken<string>>().ToTable("UserTokens");

            // BookingCombo - Composite Key
            builder.Entity<BookingCombo>()
                .HasKey(bc => new { bc.BookingId, bc.ComboId });

            builder.Entity<BookingCombo>()
                .HasOne(bc => bc.Booking)
                .WithMany(b => b.BookingCombos)
                .HasForeignKey(bc => bc.BookingId);

            builder.Entity<BookingCombo>()
                .HasOne(bc => bc.Combo)
                .WithMany(c => c.BookingCombos)
                .HasForeignKey(bc => bc.ComboId);

            // Booking - Payment (1-1)
            builder.Entity<Payment>()
                .HasOne(p => p.Booking)
                .WithOne(b => b.Payment)
                .HasForeignKey<Payment>(p => p.BookingId);

            // Restrict Cascade Delete to prevent deleting a User deleting all Bookings, etc.
            builder.Entity<Booking>()
                .HasOne(b => b.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Booking>()
                .HasOne(b => b.Showtime)
                .WithMany(s => s.Bookings)
                .HasForeignKey(b => b.ShowtimeId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Showtime>()
                .HasOne(s => s.Movie)
                .WithMany(m => m.Showtimes)
                .HasForeignKey(s => s.MovieId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Showtime>()
                .HasOne(s => s.Room)
                .WithMany(r => r.Showtimes)
                .HasForeignKey(s => s.RoomId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Ticket>()
                .HasOne(t => t.Booking)
                .WithMany(b => b.Tickets)
                .HasForeignKey(t => t.BookingId)
                .OnDelete(DeleteBehavior.Cascade); // If booking is deleted, tickets can be deleted

            builder.Entity<Ticket>()
                .HasOne(t => t.Seat)
                .WithMany(s => s.Tickets)
                .HasForeignKey(t => t.SeatId)
                .OnDelete(DeleteBehavior.Restrict);
                
            // Ensure unique voucher code
            builder.Entity<Voucher>()
                .HasIndex(v => v.Code)
                .IsUnique();
                
            // Decimal configurations
            builder.Entity<Voucher>().Property(x => x.MaxDiscount).HasColumnType("decimal(10,2)");
            builder.Entity<Combo>().Property(x => x.Price).HasColumnType("decimal(10,2)");
            builder.Entity<Showtime>().Property(x => x.BasePrice).HasColumnType("decimal(10,2)");
            builder.Entity<Booking>().Property(x => x.TotalPrice).HasColumnType("decimal(10,2)");
            builder.Entity<BookingCombo>().Property(x => x.Price).HasColumnType("decimal(10,2)");
            builder.Entity<Payment>().Property(x => x.Amount).HasColumnType("decimal(10,2)");
            builder.Entity<Ticket>().Property(x => x.Price).HasColumnType("decimal(10,2)");
        }
    }
}

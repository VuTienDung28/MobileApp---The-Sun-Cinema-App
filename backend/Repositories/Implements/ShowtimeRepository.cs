using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using backend.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Implements
{
    public class ShowtimeRepository : IShowtimeRepository
    {
        private readonly AppDbContext _db;

        public ShowtimeRepository(AppDbContext db)
        {
            _db = db;
        }

        // =============================================
        // GET BY ID
        // Kèm đầy đủ navigation: Movie, Room → Cinema, Seats
        // =============================================
        public async Task<Showtime?> GetByIdAsync(int id)
        {
            return await _db.Showtimes
                .Include(s => s.Movie)
                .Include(s => s.Room)
                    .ThenInclude(r => r.Cinema)
                .Include(s => s.Room)
                    .ThenInclude(r => r.Seats)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        // =============================================
        // GET BY MOVIE AND DATE
        // Lọc các suất chiếu của 1 phim trong ngày cụ thể
        // Kèm Room → Cinema + Seats để tính AvailableSeats và group by rạp
        // =============================================
        public async Task<IEnumerable<Showtime>> GetByMovieAndDateAsync(int movieId, DateTime date)
        {
            var dayStart = date.Date;
            var dayEnd = dayStart.AddDays(1);

            return await _db.Showtimes
                .AsNoTracking()
                .Include(s => s.Room)
                    .ThenInclude(r => r.Cinema)
                .Include(s => s.Room)
                    .ThenInclude(r => r.Seats)
                .Include(s => s.Movie)
                .Where(s =>
                    s.MovieId == movieId &&
                    s.StartTime >= dayStart &&
                    s.StartTime < dayEnd)
                .OrderBy(s => s.Room.Cinema.Name)
                .ThenBy(s => s.StartTime)
                .ToListAsync();
        }

        // =============================================
        // GET BY CINEMA AND DATE
        // Lọc các suất chiếu của 1 rạp trong ngày cụ thể
        // Kèm Movie + Room → Seats để group by phim
        // =============================================
        public async Task<IEnumerable<Showtime>> GetByCinemaAndDateAsync(int cinemaId, DateTime date)
        {
            var dayStart = date.Date;
            var dayEnd = dayStart.AddDays(1);

            return await _db.Showtimes
                .AsNoTracking()
                .Include(s => s.Movie)
                .Include(s => s.Room)
                    .ThenInclude(r => r.Cinema)
                .Include(s => s.Room)
                    .ThenInclude(r => r.Seats)
                .Where(s =>
                    s.Room.CinemaId == cinemaId &&
                    s.StartTime >= dayStart &&
                    s.StartTime < dayEnd)
                .OrderBy(s => s.Movie.Title)
                .ThenBy(s => s.StartTime)
                .ToListAsync();
        }

        // =============================================
        // ADD
        // =============================================
        public async Task<Showtime> AddAsync(Showtime showtime)
        {
            _db.Showtimes.Add(showtime);
            await _db.SaveChangesAsync();
            return showtime;
        }

        // =============================================
        // UPDATE
        // =============================================
        public async Task UpdateAsync(Showtime showtime)
        {
            _db.Showtimes.Update(showtime);
            await _db.SaveChangesAsync();
        }

        // =============================================
        // DELETE
        // =============================================
        public async Task DeleteAsync(Showtime showtime)
        {
            _db.Showtimes.Remove(showtime);
            await _db.SaveChangesAsync();
        }

        // =============================================
        // HAS CONFLICT
        // Kiểm tra overlap lịch chiếu trong cùng phòng.
        // Thuật toán: 2 khoảng [A_start, A_end) và [B_start, B_end) overlap khi:
        //   A_start < B_end AND A_end > B_start
        // excludeId: loại trừ suất chiếu đang update
        // =============================================
        public async Task<bool> HasConflictAsync(int roomId, DateTime start, DateTime end, int? excludeId = null)
        {
            return await _db.Showtimes.AnyAsync(s =>
                s.RoomId == roomId &&
                (excludeId == null || s.Id != excludeId) &&
                s.StartTime < end &&
                // EndTime của suất hiện có = StartTime + Duration(phút) + 15p buffer
                // Vì không lưu EndTime trong DB, ta tính gần đúng:
                // Dùng StartTime + 2 giờ là minimum (phim ngắn nhất ~90 phút + 30 phút buffer)
                // → để chính xác, join thêm Movie để lấy Duration
                s.StartTime.AddMinutes(s.Movie.Duration + 15) > start);
        }

        // =============================================
        // COUNT BOOKED SEATS
        // Đếm số ghế đã được đặt vé trong suất chiếu này
        // Chỉ tính Booking có Status != "Cancelled"
        // =============================================
        public async Task<int> CountBookedSeatsAsync(int showtimeId)
        {
            return await _db.Tickets
                .CountAsync(t =>
                    t.Booking.ShowtimeId == showtimeId &&
                    t.Booking.Status != "Cancelled");
        }

        // =============================================
        // GET BOOKED AND PENDING SEAT IDS
        // Lấy danh sách ID các ghế đã được mua hoặc đang được giữ (Pending < 10 phút)
        // =============================================
        public async Task<IEnumerable<int>> GetBookedAndPendingSeatIdsAsync(int showtimeId)
        {
            var tenMinsAgo = DateTime.UtcNow.AddMinutes(-10);
            return await _db.Tickets
                .Where(t => t.Booking.ShowtimeId == showtimeId &&
                            (t.Booking.Status == "Completed" || 
                            (t.Booking.Status == "Pending" && t.Booking.BookingTime > tenMinsAgo)))
                .Select(t => t.SeatId)
                .ToListAsync();
        }
    }
}

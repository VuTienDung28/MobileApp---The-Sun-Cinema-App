using backend.Data;
using backend.Models;
using backend.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Implements
{
    public class MovieRepository : IMovieRepository
    {
        private readonly AppDbContext _db;

        public MovieRepository(AppDbContext db)
        {
            _db = db;
        }

        // =============================================
        // GET ALL
        // =============================================
        public async Task<IEnumerable<Movie>> GetAllAsync()
        {
            return await _db.Movies
                .AsNoTracking()
                .OrderByDescending(m => m.ReleaseDate)
                .ToListAsync();
        }

        // =============================================
        // GET NOW SHOWING
        // Phim có ít nhất 1 Showtime trong 7 ngày tới
        // =============================================
        public async Task<IEnumerable<Movie>> GetNowShowingAsync()
        {
            // Lấy thời điểm hiện tại theo giờ Việt Nam
            var nowVN = DateTime.UtcNow.AddHours(7);
            var today = nowVN.Date;
            var startRange = today.AddDays(-20);
            var endRange = today.AddDays(1).AddTicks(-1); // Hết ngày hôm nay

            // Phim ra mắt trong vòng 20 ngày qua tính đến hết ngày hôm nay
            return await _db.Movies
                .AsNoTracking()
                .Where(m => m.ReleaseDate <= endRange && m.ReleaseDate >= startRange)
                .OrderByDescending(m => m.ReleaseDate)
                .ToListAsync();
        }

        // =============================================
        // GET COMING SOON
        // Phim chưa có Showtime nào (sắp ra mắt)
        // =============================================
        public async Task<IEnumerable<Movie>> GetComingSoonAsync()
        {
            var nowVN = DateTime.UtcNow.AddHours(7);
            var endOfToday = nowVN.Date.AddDays(1); // Bắt đầu từ ngày mai

            // Phim có ngày phát hành từ ngày mai trở đi
            return await _db.Movies
                .AsNoTracking()
                .Where(m => m.ReleaseDate >= endOfToday)
                .OrderBy(m => m.ReleaseDate)
                .ToListAsync();
        }

        // =============================================
        // GET BY ID (include Showtimes để check delete)
        // =============================================
        public async Task<Movie?> GetByIdAsync(int id)
        {
            return await _db.Movies
                .Include(m => m.Showtimes)
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        // =============================================
        // ADD
        // =============================================
        public async Task<Movie> AddAsync(Movie movie)
        {
            _db.Movies.Add(movie);
            await _db.SaveChangesAsync();
            return movie;
        }

        // =============================================
        // UPDATE
        // =============================================
        public async Task UpdateAsync(Movie movie)
        {
            _db.Movies.Update(movie);
            await _db.SaveChangesAsync();
        }

        // =============================================
        // DELETE
        // =============================================
        public async Task DeleteAsync(Movie movie)
        {
            _db.Movies.Remove(movie);
            await _db.SaveChangesAsync();
        }

        // =============================================
        // EXISTS BY TITLE
        // excludeId: bỏ qua phim hiện tại khi Update
        // =============================================
        public async Task<bool> ExistsByTitleAsync(string title, int? excludeId = null)
        {
            return await _db.Movies.AnyAsync(m =>
                m.Title == title && (excludeId == null || m.Id != excludeId));
        }
    }
}

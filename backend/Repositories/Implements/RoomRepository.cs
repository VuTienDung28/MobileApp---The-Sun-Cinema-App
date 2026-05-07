using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using backend.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Implements
{
    public class RoomRepository : IRoomRepository
    {
        private readonly AppDbContext _db;

        public RoomRepository(AppDbContext db)
        {
            _db = db;
        }

        // =============================================
        // GET BY CINEMA ID
        // Lấy tất cả phòng của 1 rạp, kèm theo số ghế
        // =============================================
        public async Task<IEnumerable<Room>> GetByCinemaIdAsync(int cinemaId)
        {
            return await _db.Rooms
                .AsNoTracking()
                .Include(r => r.Seats)
                .Where(r => r.CinemaId == cinemaId)
                .OrderBy(r => r.Name)
                .ToListAsync();
        }

        // =============================================
        // GET BY ID
        // Kèm theo Cinema (để lấy tên rạp) và Seats
        // =============================================
        public async Task<Room?> GetByIdAsync(int id)
        {
            return await _db.Rooms
                .Include(r => r.Cinema)
                .Include(r => r.Seats)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        // =============================================
        // ADD
        // =============================================
        public async Task<Room> AddAsync(Room room)
        {
            _db.Rooms.Add(room);
            await _db.SaveChangesAsync();
            return room;
        }

        // =============================================
        // UPDATE
        // =============================================
        public async Task UpdateAsync(Room room)
        {
            _db.Rooms.Update(room);
            await _db.SaveChangesAsync();
        }

        // =============================================
        // DELETE
        // =============================================
        public async Task DeleteAsync(Room room)
        {
            _db.Rooms.Remove(room);
            await _db.SaveChangesAsync();
        }

        // =============================================
        // EXISTS BY NAME IN CINEMA
        // Kiểm tra tên phòng đã tồn tại trong cùng 1 rạp chưa
        // excludeId: bỏ qua phòng hiện tại khi Update
        // =============================================
        public async Task<bool> ExistsByNameInCinemaAsync(int cinemaId, string name, int? excludeId = null)
        {
            return await _db.Rooms.AnyAsync(r =>
                r.CinemaId == cinemaId &&
                r.Name == name &&
                (excludeId == null || r.Id != excludeId));
        }
    }
}

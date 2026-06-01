using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using backend.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.Implements
{
    public class SeatRepository : ISeatRepository
    {
        private readonly AppDbContext _db;

        public SeatRepository(AppDbContext db)
        {
            _db = db;
        }

        // =============================================
        // GET BY ROOM ID
        // Sắp xếp: theo hàng (A→Z) rồi theo ColumnIndex tăng dần
        // =============================================
        public async Task<IEnumerable<Seat>> GetByRoomIdAsync(int roomId)
        {
            return await _db.Seats
                .AsNoTracking()
                .Where(s => s.RoomId == roomId)
                .OrderBy(s => s.RowName)
                .ThenBy(s => s.ColumnIndex)
                .ToListAsync();
        }

        // =============================================
        // GET BY ID
        // =============================================
        public async Task<Seat?> GetByIdAsync(int id)
        {
            return await _db.Seats.FindAsync(id);
        }

        // =============================================
        // UPDATE ASYNC
        // =============================================
        public async Task UpdateAsync(Seat seat)
        {
            _db.Seats.Update(seat);
            await _db.SaveChangesAsync();
        }

        // =============================================
        // ADD RANGE (bulk insert)
        // EF Core sẽ batch insert hiệu quả
        // =============================================
        public async Task AddRangeAsync(IEnumerable<Seat> seats)
        {
            await _db.Seats.AddRangeAsync(seats);
            await _db.SaveChangesAsync();
        }

        // =============================================
        // DELETE ALL BY ROOM ID
        // Xóa toàn bộ ghế của phòng để generate lại
        // =============================================
        public async Task DeleteAllByRoomIdAsync(int roomId)
        {
            var seats = await _db.Seats
                .Where(s => s.RoomId == roomId)
                .ToListAsync();

            _db.Seats.RemoveRange(seats);
            await _db.SaveChangesAsync();
        }

        // =============================================
        // HAS BOOKED TICKETS IN ROOM
        // Kiểm tra xem có ghế nào trong phòng đã được đặt vé chưa
        // Dùng để bảo vệ: không cho phép xóa ghế khi đã có lịch sử đặt vé
        // =============================================
        public async Task<bool> HasBookedTicketsInRoomAsync(int roomId)
        {
            return await _db.Tickets
                .AnyAsync(t => t.Seat.RoomId == roomId);
        }
    }
}

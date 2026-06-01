using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Repositories.Interface
{
    public interface ISeatRepository
    {
        /// <summary>Lấy tất cả ghế của 1 phòng chiếu (kèm thứ tự sắp xếp)</summary>
        Task<IEnumerable<Seat>> GetByRoomIdAsync(int roomId);

        /// <summary>Lấy 1 ghế theo Id</summary>
        Task<Seat?> GetByIdAsync(int id);

        /// <summary>Cập nhật trạng thái của ghế</summary>
        Task UpdateAsync(Seat seat);

        /// <summary>Thêm nhiều ghế cùng lúc (bulk insert)</summary>
        Task AddRangeAsync(IEnumerable<Seat> seats);

        /// <summary>Xóa toàn bộ ghế trong 1 phòng (để generate lại)</summary>
        Task DeleteAllByRoomIdAsync(int roomId);

        /// <summary>Kiểm tra phòng có ghế nào đã từng được đặt vé chưa</summary>
        Task<bool> HasBookedTicketsInRoomAsync(int roomId);
    }
}

using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Repositories.Interface
{
    public interface IRoomRepository
    {
        /// <summary>Lấy danh sách phòng chiếu theo rạp (kèm số lượng ghế)</summary>
        Task<IEnumerable<Room>> GetByCinemaIdAsync(int cinemaId);

        /// <summary>Lấy chi tiết 1 phòng chiếu theo Id</summary>
        Task<Room?> GetByIdAsync(int id);

        /// <summary>Thêm phòng chiếu mới vào DB</summary>
        Task<Room> AddAsync(Room room);

        /// <summary>Lưu thay đổi phòng chiếu vào DB</summary>
        Task UpdateAsync(Room room);

        /// <summary>Xóa phòng chiếu khỏi DB</summary>
        Task DeleteAsync(Room room);

        /// <summary>Kiểm tra tên phòng đã tồn tại trong cùng rạp chưa</summary>
        Task<bool> ExistsByNameInCinemaAsync(int cinemaId, string name, int? excludeId = null);
    }
}

using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Repositories.Interface
{
    public interface ICinemaRepository
    {
        /// <summary>Lấy toàn bộ danh sách rạp chiếu phim</summary>
        Task<IEnumerable<Cinema>> GetAllAsync();

        /// <summary>Lấy chi tiết rạp theo Id kèm theo danh sách phòng chiếu</summary>
        Task<Cinema?> GetByIdAsync(int id);

        /// <summary>Thêm rạp chiếu mới vào DB</summary>
        Task<Cinema> AddAsync(Cinema cinema);

        /// <summary>Lưu thay đổi rạp chiếu vào DB</summary>
        Task UpdateAsync(Cinema cinema);

        /// <summary>Xóa rạp chiếu khỏi DB</summary>
        Task DeleteAsync(Cinema cinema);

        /// <summary>Kiểm tra tên rạp đã tồn tại chưa (dùng khi tạo / đổi tên)</summary>
        Task<bool> ExistsByNameAsync(string name, int? excludeId = null);
    }
}

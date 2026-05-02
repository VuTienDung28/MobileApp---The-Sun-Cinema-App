using System.Collections.Generic;
using System.Threading.Tasks;
using backend.DTOs;

namespace backend.Services.Interface
{
    public interface ICinemaService
    {
        /// <summary>Lấy toàn bộ danh sách rạp chiếu phim</summary>
        Task<IEnumerable<CinemaListItemDto>> GetAllAsync();

        /// <summary>Lấy chi tiết rạp theo Id</summary>
        Task<CinemaDetailDto> GetByIdAsync(int id);

        /// <summary>Tạo rạp chiếu phim mới</summary>
        Task<CinemaDetailDto> CreateAsync(CreateCinemaDto dto);

        /// <summary>Cập nhật thông tin rạp chiếu phim</summary>
        Task<CinemaDetailDto> UpdateAsync(int id, UpdateCinemaDto dto);

        /// <summary>Xóa rạp chiếu phim (từ chối nếu đang có phòng chiếu)</summary>
        Task DeleteAsync(int id);
    }
}

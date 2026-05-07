using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.DTOs;

namespace backend.Services.Interface
{
    public interface IShowtimeService
    {
        // ===== USER — Public =====

        /// <summary>Chi tiết 1 suất chiếu (kèm AvailableSeats)</summary>
        Task<ShowtimeDetailDto> GetByIdAsync(int id);

        /// <summary>
        /// Danh sách suất chiếu của 1 phim theo ngày — nhóm theo rạp.
        /// Dùng cho màn hình "Chọn Suất Chiếu" sau khi user bấm "Đặt vé".
        /// </summary>
        Task<IEnumerable<ShowtimesByCinemaDto>> GetByMovieAndDateAsync(int movieId, DateTime date);

        /// <summary>
        /// Danh sách suất chiếu của 1 rạp theo ngày — nhóm theo phim.
        /// Dùng để xem lịch chiếu của rạp trong ngày.
        /// </summary>
        Task<IEnumerable<ShowtimesByMovieDto>> GetByCinemaAndDateAsync(int cinemaId, DateTime date);

        // ===== ADMIN Only =====

        /// <summary>Tạo suất chiếu mới (kiểm tra conflict trước)</summary>
        Task<ShowtimeDetailDto> CreateAsync(CreateShowtimeDto dto);

        /// <summary>Cập nhật giờ chiếu hoặc giá (kiểm tra conflict nếu đổi giờ)</summary>
        Task<ShowtimeDetailDto> UpdateAsync(int id, UpdateShowtimeDto dto);

        /// <summary>Xóa suất chiếu (từ chối nếu đã có booking)</summary>
        Task DeleteAsync(int id);
    }
}

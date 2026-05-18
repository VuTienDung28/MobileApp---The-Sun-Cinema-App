using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Repositories.Interface
{
    public interface IShowtimeRepository
    {
        /// <summary>Lấy chi tiết 1 suất chiếu kèm Movie, Room, Cinema</summary>
        Task<Showtime?> GetByIdAsync(int id);

        /// <summary>
        /// Lấy danh sách suất chiếu của 1 phim trong 1 ngày cụ thể.
        /// Kèm Room → Cinema để group theo rạp.
        /// </summary>
        Task<IEnumerable<Showtime>> GetByMovieAndDateAsync(int movieId, DateTime date);

        /// <summary>
        /// Lấy danh sách suất chiếu của 1 rạp trong 1 ngày cụ thể.
        /// Kèm Movie và Room để group theo phim.
        /// </summary>
        Task<IEnumerable<Showtime>> GetByCinemaAndDateAsync(int cinemaId, DateTime date);

        /// <summary>Thêm suất chiếu mới vào DB</summary>
        Task<Showtime> AddAsync(Showtime showtime);

        /// <summary>Lưu thay đổi suất chiếu vào DB</summary>
        Task UpdateAsync(Showtime showtime);

        /// <summary>Xóa suất chiếu khỏi DB</summary>
        Task DeleteAsync(Showtime showtime);

        /// <summary>
        /// Kiểm tra phòng có bị trùng lịch trong khoảng thời gian [start, end] không.
        /// excludeId: bỏ qua suất chiếu hiện tại khi Update.
        /// </summary>
        Task<bool> HasConflictAsync(int roomId, DateTime start, DateTime end, int? excludeId = null);

        /// <summary>Đếm số ghế đã được đặt (có vé) trong 1 suất chiếu</summary>
        Task<int> CountBookedSeatsAsync(int showtimeId);

        /// <summary>Lấy danh sách ID các ghế đã được đặt hoặc đang giữ</summary>
        Task<IEnumerable<int>> GetBookedAndPendingSeatIdsAsync(int showtimeId);
    }
}

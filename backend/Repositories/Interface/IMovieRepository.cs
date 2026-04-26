using backend.Models;

namespace backend.Repositories.Interface
{
    public interface IMovieRepository
    {
        /// <summary>Lấy toàn bộ danh sách phim</summary>
        Task<IEnumerable<Movie>> GetAllAsync();

        /// <summary>Lấy phim đang chiếu — có Showtime trong 7 ngày tới</summary>
        Task<IEnumerable<Movie>> GetNowShowingAsync();

        /// <summary>Lấy phim sắp chiếu — ReleaseDate trong tương lai và chưa có Showtime</summary>
        Task<IEnumerable<Movie>> GetComingSoonAsync();

        /// <summary>Lấy chi tiết 1 phim theo Id</summary>
        Task<Movie?> GetByIdAsync(int id);

        /// <summary>Thêm phim mới vào DB</summary>
        Task<Movie> AddAsync(Movie movie);

        /// <summary>Lưu thay đổi phim vào DB</summary>
        Task UpdateAsync(Movie movie);

        /// <summary>Xóa phim khỏi DB</summary>
        Task DeleteAsync(Movie movie);

        /// <summary>Kiểm tra title đã tồn tại chưa (dùng khi tạo / đổi tên)</summary>
        Task<bool> ExistsByTitleAsync(string title, int? excludeId = null);
    }
}

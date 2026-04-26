using backend.DTOs;
using Microsoft.AspNetCore.Http;

namespace backend.Services.Interface
{
    public interface IMovieService
    {
        // ===== Public =====

        /// <summary>Lấy toàn bộ danh sách phim</summary>
        Task<IEnumerable<MovieListItemDto>> GetAllAsync();

        /// <summary>Lấy phim đang chiếu (có showtime 7 ngày tới)</summary>
        Task<IEnumerable<MovieListItemDto>> GetNowShowingAsync();

        /// <summary>Lấy phim sắp chiếu (chưa có showtime)</summary>
        Task<IEnumerable<MovieListItemDto>> GetComingSoonAsync();

        /// <summary>Lấy chi tiết phim theo Id</summary>
        Task<MovieDetailDto> GetByIdAsync(int id);

        // ===== Admin =====

        /// <summary>Tạo phim mới</summary>
        Task<MovieDetailDto> CreateAsync(CreateMovieDto dto);

        /// <summary>Cập nhật thông tin phim</summary>
        Task<MovieDetailDto> UpdateAsync(int id, UpdateMovieDto dto);

        /// <summary>Xóa phim (từ chối nếu còn showtime)</summary>
        Task DeleteAsync(int id);

        /// <summary>Upload poster nhỏ lên MinIO → lưu ThumbnailPosterUrl</summary>
        Task<UploadPosterResponseDto> UploadThumbnailAsync(int id, IFormFile file);

        /// <summary>Upload poster lớn lên MinIO → lưu BackdropPosterUrl</summary>
        Task<UploadPosterResponseDto> UploadBackdropAsync(int id, IFormFile file);
    }
}

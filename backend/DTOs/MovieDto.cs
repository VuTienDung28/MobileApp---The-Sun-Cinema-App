using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace backend.DTOs
{
    // =============================================
    // RESPONSE DTOs
    // =============================================

    /// <summary>
    /// Dùng cho màn hình danh sách phim (now-showing, coming-soon, all)
    /// Chỉ chứa thumbnail — tiết kiệm băng thông
    /// </summary>
    public class MovieListItemDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;

        /// <summary>Thời lượng phim (phút)</summary>
        public int Duration { get; set; }

        public DateTime ReleaseDate { get; set; }

        /// <summary>Poster nhỏ — dùng cho card danh sách</summary>
        public string ThumbnailPosterUrl { get; set; } = string.Empty;

        public string AgeRestriction { get; set; } = string.Empty;
        public string MovieGenre { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public double Rating { get; set; }
        public int TotalReactions { get; set; }
    }

    /// <summary>
    /// Dùng cho trang chi tiết phim — chứa đầy đủ thông tin + backdrop
    /// </summary>
    public class MovieDetailDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Duration { get; set; }
        public DateTime ReleaseDate { get; set; }

        /// <summary>Poster nhỏ — hiển thị chồng lên backdrop (góc trái)</summary>
        public string ThumbnailPosterUrl { get; set; } = string.Empty;

        /// <summary>Poster lớn — làm ảnh nền full-width trang chi tiết</summary>
        public string BackdropPosterUrl { get; set; } = string.Empty;

        public string AgeRestriction { get; set; } = string.Empty;
        public string MovieGenre { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public double Rating { get; set; }
        public int TotalReactions { get; set; }
        public string MovieActors { get; set; } = string.Empty;
        public string Director { get; set; } = string.Empty;
    }

    // =============================================
    // REQUEST DTOs — ADMIN
    // =============================================

    /// <summary>
    /// Admin tạo phim mới (poster upload riêng qua /thumbnail và /backdrop)
    /// </summary>
    public class CreateMovieDto
    {
        [Required(ErrorMessage = "Tên phim không được để trống")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Mô tả không được để trống")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Thời lượng không được để trống")]
        [Range(1, 600, ErrorMessage = "Thời lượng phải từ 1 đến 600 phút")]
        public int Duration { get; set; }

        [Required(ErrorMessage = "Ngày khởi chiếu không được để trống")]
        public DateTime ReleaseDate { get; set; }

        public string AgeRestriction { get; set; } = string.Empty;
        public string MovieGenre { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public string MovieActors { get; set; } = string.Empty;
        public string Director { get; set; } = string.Empty;
    }

    /// <summary>
    /// Admin sửa thông tin phim — tất cả optional, chỉ cập nhật trường được gửi lên
    /// </summary>
    public class UpdateMovieDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }

        [Range(1, 600, ErrorMessage = "Thời lượng phải từ 1 đến 600 phút")]
        public int? Duration { get; set; }

        public DateTime? ReleaseDate { get; set; }
        public string? AgeRestriction { get; set; }
        public string? MovieGenre { get; set; }
        public string? Language { get; set; }
        public string? MovieActors { get; set; }
        public string? Director { get; set; }
    }

    // =============================================
    // REQUEST / RESPONSE DTOs — POSTER UPLOAD
    // =============================================

    /// <summary>
    /// Bọc IFormFile để Swagger sinh đúng schema multipart/form-data
    /// Dùng chung cho cả thumbnail và backdrop
    /// </summary>
    public class UploadPosterRequestDto
    {
        [Required(ErrorMessage = "Vui lòng chọn file ảnh")]
        public IFormFile File { get; set; } = null!;
    }

    /// <summary>
    /// Trả về relative path sau khi upload poster thành công
    /// </summary>
    public class UploadPosterResponseDto
    {
        /// <summary>
        /// Đường dẫn tương đối. VD: /movie-images/thumbnails/1_1714000000.jpg
        /// Frontend tự ghép MinIO base URL để hiển thị.
        /// </summary>
        public string RelativePath { get; set; } = string.Empty;
    }
}

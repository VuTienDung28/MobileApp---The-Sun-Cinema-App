using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // =============================================
    // SHOWTIME — RESPONSE DTOs
    // =============================================

    /// <summary>Chi tiết đầy đủ 1 suất chiếu — dùng cho Admin và màn hình chi tiết User</summary>
    public class ShowtimeDetailDto
    {
        public int Id { get; set; }

        public int MovieId { get; set; }
        public string MovieTitle { get; set; } = string.Empty;
        public string MovieThumbnailUrl { get; set; } = string.Empty;
        public int MovieDuration { get; set; }

        public int RoomId { get; set; }
        public string RoomName { get; set; } = string.Empty;
        public int CinemaId { get; set; }
        public string CinemaName { get; set; } = string.Empty;
        public string CinemaAddress { get; set; } = string.Empty;

        public DateTime StartTime { get; set; }

        /// <summary>StartTime + Movie.Duration + 15 phút buffer — tính on-the-fly, không lưu DB</summary>
        public DateTime EndTime { get; set; }

        public decimal BasePrice { get; set; }
        public int TotalSeats { get; set; }
        public int AvailableSeats { get; set; }
    }

    /// <summary>
    /// 1 khung giờ chiếu nhỏ gọn — dùng trong danh sách chọn suất chiếu.
    /// Gồm các thông tin cần để user bấm chọn và hiển thị nhanh.
    /// </summary>
    public class ShowtimeSlotDto
    {
        public int Id { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal BasePrice { get; set; }
        public int RoomId { get; set; }
        public string RoomName { get; set; } = string.Empty;
        public int AvailableSeats { get; set; }
    }

    /// <summary>
    /// Kết quả khi user xem suất chiếu của 1 phim theo ngày.
    /// Nhóm theo rạp → mỗi rạp có danh sách các khung giờ chiếu.
    /// Dùng cho màn hình "Chọn Suất Chiếu" (ShowtimeScreen).
    /// </summary>
    public class ShowtimesByCinemaDto
    {
        public int CinemaId { get; set; }
        public string CinemaName { get; set; } = string.Empty;
        public string CinemaAddress { get; set; } = string.Empty;
        public ICollection<ShowtimeSlotDto> Showtimes { get; set; } = new List<ShowtimeSlotDto>();
    }

    /// <summary>
    /// Kết quả khi user xem lịch chiếu của 1 rạp theo ngày.
    /// Nhóm theo phim → mỗi phim có danh sách các khung giờ chiếu trong ngày.
    /// </summary>
    public class ShowtimesByMovieDto
    {
        public int MovieId { get; set; }
        public string MovieTitle { get; set; } = string.Empty;
        public string MovieThumbnailUrl { get; set; } = string.Empty;
        public int MovieDuration { get; set; }
        public string AgeRestriction { get; set; } = string.Empty;
        public ICollection<ShowtimeSlotDto> Showtimes { get; set; } = new List<ShowtimeSlotDto>();
    }

    // =============================================
    // SHOWTIME — REQUEST DTOs (ADMIN)
    // =============================================

    public class CreateShowtimeDto
    {
        [Required(ErrorMessage = "Vui lòng chọn phim")]
        public int MovieId { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn phòng chiếu")]
        public int RoomId { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn giờ bắt đầu")]
        public DateTime StartTime { get; set; }

        [Required]
        [Range(0, 9_999_999, ErrorMessage = "Giá vé không hợp lệ")]
        public decimal BasePrice { get; set; }
    }

    public class UpdateShowtimeDto
    {
        public DateTime? StartTime { get; set; }

        [Range(0, 9_999_999, ErrorMessage = "Giá vé không hợp lệ")]
        public decimal? BasePrice { get; set; }
    }
}

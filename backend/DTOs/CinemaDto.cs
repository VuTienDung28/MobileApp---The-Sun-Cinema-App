using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // =============================================
    // CINEMA — RESPONSE DTOs
    // =============================================

    public class CinemaListItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }

    public class CinemaDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public ICollection<RoomInCinemaDto> Rooms { get; set; } = new List<RoomInCinemaDto>();
    }

    public class RoomInCinemaDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int TotalSeats { get; set; }
    }

    // =============================================
    // CINEMA — REQUEST DTOs (ADMIN)
    // =============================================

    public class CreateCinemaDto
    {
        [Required(ErrorMessage = "Tên rạp chiếu phim không được để trống")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Địa chỉ rạp chiếu phim không được để trống")]
        public string Address { get; set; } = string.Empty;
        
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }

    public class UpdateCinemaDto
    {
        public string? Name { get; set; }
        public string? Address { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
    }

    // =============================================
    // ROOM — RESPONSE DTOs
    // =============================================

    public class RoomDetailDto
    {
        public int Id { get; set; }
        public int CinemaId { get; set; }
        public string CinemaName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public int TotalSeats { get; set; }
    }

    // =============================================
    // ROOM — REQUEST DTOs (ADMIN)
    // =============================================

    public class CreateRoomDto
    {
        [Required(ErrorMessage = "Tên phòng chiếu không được để trống")]
        [MaxLength(100, ErrorMessage = "Tên phòng chiếu không được vượt quá 100 ký tự")]
        public string Name { get; set; } = string.Empty;
    }

    public class UpdateRoomDto
    {
        [MaxLength(100, ErrorMessage = "Tên phòng chiếu không được vượt quá 100 ký tự")]
        public string? Name { get; set; }
    }

    // =============================================
    // SEAT — RESPONSE DTOs
    // =============================================

    /// <summary>Thông tin 1 ghế trả về cho client</summary>
    public class SeatDto
    {
        public int Id { get; set; }
        public string RowName { get; set; } = string.Empty;

        /// <summary>Số in trên vé (liên tục, bỏ qua lối đi)</summary>
        public int SeatNumber { get; set; }

        /// <summary>Vị trí vật lý trong grid — frontend dùng để đặt ghế đúng ô</summary>
        public int ColumnIndex { get; set; }

        /// <summary>Standard | VIP | Couple</summary>
        public string Type { get; set; } = string.Empty;
    }

    /// <summary>Layout đầy đủ của phòng chiếu — trả về kèm tổng số cột để frontend dựng grid</summary>
    public class RoomSeatLayoutDto
    {
        public int RoomId { get; set; }
        public string RoomName { get; set; } = string.Empty;

        /// <summary>Tổng số cột vật lý (tính cả lối đi) — frontend tạo mảng có kích thước này</summary>
        public int TotalColumns { get; set; }

        public ICollection<SeatDto> Seats { get; set; } = new List<SeatDto>();
    }

    // =============================================
    // SEAT — REQUEST DTOs (ADMIN)
    // =============================================

    /// <summary>Cấu hình của 1 hàng ghế khi generate</summary>
    public class SeatRowConfigDto
    {
        [Required(ErrorMessage = "Tên hàng ghế không được để trống")]
        [MaxLength(5, ErrorMessage = "Tên hàng tối đa 5 ký tự (ví dụ: A, B, VIP)")]
        public string RowName { get; set; } = string.Empty;

        /// <summary>Standard | VIP | Couple</summary>
        [Required(ErrorMessage = "Loại ghế không được để trống")]
        public string Type { get; set; } = string.Empty;

        /// <summary>
        /// Danh sách các cột bị ẩn/khuyết (không tạo ghế ở vị trí này) cho riêng hàng này.
        /// Dùng cho các rạp có góc bo tròn, vướng cột, hoặc hàng ghế ngắn hơn các hàng khác.
        /// </summary>
        public List<int>? HiddenColumns { get; set; }
    }

    /// <summary>
    /// Request body để Admin generate toàn bộ ghế cho 1 phòng chiếu.
    /// Backend tự tính SeatNumber và ColumnIndex dựa trên cấu hình này.
    /// </summary>
    public class GenerateSeatsDto
    {
        /// <summary>
        /// Tổng số cột vật lý của grid (tính cả cột lối đi).
        /// Ví dụ phòng 9 ghế/hàng + 2 lối đi = TotalColumns 11.
        /// </summary>
        [Required]
        [Range(1, 100, ErrorMessage = "TotalColumns phải từ 1 đến 100")]
        public int TotalColumns { get; set; }

        /// <summary>
        /// Danh sách các ColumnIndex là lối đi (không tạo ghế ở đây).
        /// Ví dụ: [4, 8] nghĩa là cột vật lý số 4 và 8 là lối đi.
        /// Để trống nếu không có lối đi.
        /// </summary>
        public List<int> AisleAtColumns { get; set; } = new();

        /// <summary>Danh sách cấu hình từng hàng ghế (theo thứ tự từ trên xuống)</summary>
        [Required]
        [MinLength(1, ErrorMessage = "Phải có ít nhất 1 hàng ghế")]
        public List<SeatRowConfigDto> Rows { get; set; } = new();

        /// <summary>
        /// Đổi chiều đánh số ghế (True: từ phải sang trái, False: từ trái sang phải)
        /// </summary>
        public bool IsNumberingFromRight { get; set; } = false;
    }
}

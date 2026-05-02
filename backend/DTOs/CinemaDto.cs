using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    // =============================================
    // RESPONSE DTOs
    // =============================================

    public class CinemaListItemDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
    }

    public class CinemaDetailDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public ICollection<RoomInCinemaDto> Rooms { get; set; } = new List<RoomInCinemaDto>();
    }

    public class RoomInCinemaDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    // =============================================
    // REQUEST DTOs — ADMIN
    // =============================================

    public class CreateCinemaDto
    {
        [Required(ErrorMessage = "Tên rạp chiếu phim không được để trống")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Địa chỉ rạp chiếu phim không được để trống")]
        public string Address { get; set; } = string.Empty;
    }

    public class UpdateCinemaDto
    {
        public string? Name { get; set; }
        public string? Address { get; set; }
    }
}

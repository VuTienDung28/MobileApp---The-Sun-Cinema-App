using Microsoft.AspNetCore.Identity;
using System.Collections.Generic;
using System;

namespace backend.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public string? Province { get; set; }
        public string? District { get; set; }

        /// <summary>Đường dẫn tương đối ảnh đại diện, vd: /avatar-images/user123_1714.jpg</summary>
        public string? AvatarUrl { get; set; }

        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
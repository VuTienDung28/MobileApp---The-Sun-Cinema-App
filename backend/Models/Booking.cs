using System;
using System.Collections.Generic;

namespace backend.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public int ShowtimeId { get; set; }
        public int? VoucherId { get; set; }
        public DateTime BookingTime { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; } = string.Empty;

        public ApplicationUser User { get; set; } = null!;
        public Showtime Showtime { get; set; } = null!;
        public Voucher? Voucher { get; set; }
        public Payment? Payment { get; set; }
        public ICollection<BookingCombo> BookingCombos { get; set; } = new List<BookingCombo>();
        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    }
}
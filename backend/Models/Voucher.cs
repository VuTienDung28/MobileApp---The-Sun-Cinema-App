using System;
using System.Collections.Generic;
using System.ComponentModel;

namespace backend.Models
{
    public class Voucher
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string DiscountType { get; set; } = string.Empty; // "percentage" or "fixed"
        public decimal DiscountValue { get; set; }
        public decimal MinOrderValue { get; set; }
        public decimal? MaxDiscount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int UsageLimit { get; set; }
        public int UsedCount { get; set; }
        public bool IsActive { get; set; } = true;

        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}


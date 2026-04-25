using System;
using System.Collections.Generic;
using System.ComponentModel;

namespace backend.Models
{
    public class Voucher
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public int DiscountPercent { get; set; }
        public decimal MaxDiscount { get; set; }
        public DateTime ExpirationDate { get; set; }

        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}


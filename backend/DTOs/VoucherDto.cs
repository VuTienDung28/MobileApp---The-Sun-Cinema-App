using System;

namespace backend.DTOs
{
    public class VoucherDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string DiscountType { get; set; } = string.Empty;
        public decimal DiscountValue { get; set; }
        public decimal MinOrderValue { get; set; }
        public decimal? MaxDiscount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int UsageLimit { get; set; }
        public int UsedCount { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateVoucherDto
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string DiscountType { get; set; } = string.Empty;
        public decimal DiscountValue { get; set; }
        public decimal MinOrderValue { get; set; }
        public decimal? MaxDiscount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int UsageLimit { get; set; }
    }
}

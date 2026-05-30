namespace backend.Dtos
{
    public class HoldBookingResponseDto
    {
        public int BookingId { get; set; }
        public decimal SeatTotal { get; set; }
        public decimal FoodTotal { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalPrice { get; set; }
        public int? VoucherId { get; set; }
        public string? VoucherCode { get; set; }
        public string QrUrl { get; set; } = string.Empty;
    }
}

namespace backend.Dtos
{
    public class HoldBookingResponseDto
    {
        public int BookingId { get; set; }
        public decimal TotalPrice { get; set; }
        public string QrUrl { get; set; } = string.Empty;
    }
}

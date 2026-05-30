namespace backend.Dtos
{
    public class HoldBookingRequest
    {
        public int ShowtimeId { get; set; }
        public List<int> SeatIds { get; set; } = new List<int>();
        public decimal FoodTotal { get; set; }
        public string? VoucherCode { get; set; }
    }
}

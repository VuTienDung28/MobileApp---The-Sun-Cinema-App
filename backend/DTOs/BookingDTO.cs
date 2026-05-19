namespace backend.Dtos
{
    public class HoldBookingRequest
    {
        public int ShowtimeId { get; set; }
        public List<int> SeatIds { get; set; } = new List<int>();
        // Có thể thêm userId nếu không dùng token
        // public string UserId { get; set; }
    }
}

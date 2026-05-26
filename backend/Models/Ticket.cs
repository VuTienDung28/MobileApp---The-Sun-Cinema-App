namespace backend.Models
{
    public class Ticket
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public int? SeatId { get; set; }
        public string SeatName { get; set; } = string.Empty;
        public string SeatType { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? TicketCode { get; set; }
        public string? QrCodeUrl { get; set; }

        public Booking Booking { get; set; } = null!;
        public Seat? Seat { get; set; }
    }
}

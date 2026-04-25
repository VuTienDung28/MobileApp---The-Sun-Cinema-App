namespace backend.Models
{
    public class BookingCombo
    {
        public int BookingId { get; set; }
        public int ComboId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }

        public Booking Booking { get; set; } = null!;
        public Combo Combo { get; set; } = null!;
    }
}

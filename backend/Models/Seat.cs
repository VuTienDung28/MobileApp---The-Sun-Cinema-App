using System.Collections.Generic;

namespace backend.Models
{
    public class Seat
    {
        public int Id { get; set; }
        public int RoomId { get; set; }
        public string RowName { get; set; } = string.Empty;
        public int SeatNumber { get; set; }
        public string Type { get; set; } = string.Empty;

        public Room Room { get; set; } = null!;
        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    }
}
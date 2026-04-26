using System.Collections.Generic;

namespace backend.Models
{
    public class Room
    {
        public int Id { get; set; }
        public int CinemaId { get; set; }
        public string Name { get; set; } = string.Empty;

        public Cinema Cinema { get; set; } = null!;
        public ICollection<Seat> Seats { get; set; } = new List<Seat>();
        public ICollection<Showtime> Showtimes { get; set; } = new List<Showtime>();
    }
}
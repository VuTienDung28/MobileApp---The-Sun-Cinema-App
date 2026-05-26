using System.Collections.Generic;

namespace backend.Models
{
    public class Cinema
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public ICollection<Room> Rooms { get; set; } = new List<Room>();
    }
}
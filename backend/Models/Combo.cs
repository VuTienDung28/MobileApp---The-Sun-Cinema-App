using System.Collections.Generic;

namespace backend.Models
{
    public class Combo
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;

        public ICollection<BookingCombo> BookingCombos { get; set; } = new List<BookingCombo>();
    }
}
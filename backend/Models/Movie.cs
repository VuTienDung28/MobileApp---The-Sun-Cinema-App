using System;
using System.Collections.Generic;

namespace backend.Models
{
    public class Movie
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Duration { get; set; }
        public DateTime ReleaseDate { get; set; }
        public string PosterUrl { get; set; } = string.Empty;
        public string AgeRestriction { get; set; } = string.Empty;
        public string MovieGenre { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public double Rating { get; set; }
        public int TotalReactions { get; set; }
        public string MovieActors { get; set; } = string.Empty;
        public string Director { get; set; } = string.Empty;

        public ICollection<Showtime> Showtimes { get; set; } = new List<Showtime>();
    }
}

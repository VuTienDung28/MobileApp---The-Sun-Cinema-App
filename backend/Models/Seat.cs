using System.Collections.Generic;

namespace backend.Models
{
    public class Seat
    {
        public int Id { get; set; }
        public int RoomId { get; set; }
        public string RowName { get; set; } = string.Empty;

        /// <summary>Số in trên vé — đếm liên tục 1, 2, 3... bỏ qua lối đi</summary>
        public int SeatNumber { get; set; }

        /// <summary>Vị trí vật lý trong grid — tính cả ô lối đi, dùng để frontend render đúng chỗ</summary>
        public int ColumnIndex { get; set; }

        /// <summary>Loại ghế: Standard | VIP | Couple</summary>
        public string Type { get; set; } = string.Empty;

        public Room Room { get; set; } = null!;
        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    }
}
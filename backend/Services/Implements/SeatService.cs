using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Exceptions;
using backend.Models;
using backend.Repositories.Interface;
using backend.Services.Interface;

namespace backend.Services.Implements
{
    public class SeatService : ISeatService
    {
        private readonly ISeatRepository _seatRepository;
        private readonly IRoomRepository _roomRepository;

        public SeatService(ISeatRepository seatRepository, IRoomRepository roomRepository)
        {
            _seatRepository = seatRepository;
            _roomRepository = roomRepository;
        }

        // =============================================
        // GET LAYOUT BY ROOM ID
        // =============================================
        public async Task<RoomSeatLayoutDto> GetLayoutByRoomIdAsync(int roomId)
        {
            var room = await _roomRepository.GetByIdAsync(roomId)
                ?? throw new UserFriendlyException("Không tìm thấy phòng chiếu.", "ROOM_NOT_FOUND");

            var seats = await _seatRepository.GetByRoomIdAsync(roomId);
            var seatList = seats.ToList();

            // TotalColumns = ColumnIndex lớn nhất trong tất cả ghế
            // Nếu chưa có ghế → TotalColumns = 0
            int totalColumns = seatList.Any() ? seatList.Max(s => s.ColumnIndex) : 0;

            return new RoomSeatLayoutDto
            {
                RoomId = room.Id,
                RoomName = room.Name,
                TotalColumns = totalColumns,
                Seats = seatList.Select(MapToSeatDto).ToList()
            };
        }

        // =============================================
        // GENERATE SEATS
        // Tự động sinh ghế dựa trên cấu hình:
        //   - TotalColumns: tổng số cột vật lý
        //   - AisleAtColumns: danh sách cột là lối đi
        //   - Rows: cấu hình từng hàng
        // =============================================
        public async Task<RoomSeatLayoutDto> GenerateSeatsAsync(int roomId, GenerateSeatsDto dto)
        {
            var room = await _roomRepository.GetByIdAsync(roomId)
                ?? throw new UserFriendlyException("Không tìm thấy phòng chiếu.", "ROOM_NOT_FOUND");

            // Bảo vệ: không cho generate lại nếu đã có vé được đặt
            if (await _seatRepository.HasBookedTicketsInRoomAsync(roomId))
                throw new UserFriendlyException(
                    "Không thể thay đổi sơ đồ ghế vì phòng này đã có vé được đặt.",
                    "ROOM_HAS_BOOKED_TICKETS");

            // Validate: tên hàng không được trùng nhau
            var duplicateRows = dto.Rows
                .GroupBy(r => r.RowName)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();
            if (duplicateRows.Any())
                throw new UserFriendlyException(
                    $"Tên hàng bị trùng: {string.Join(", ", duplicateRows)}. Mỗi hàng phải có tên duy nhất.",
                    "DUPLICATE_ROW_NAMES");

            // Validate: AisleAtColumns phải nằm trong khoảng [1, TotalColumns]
            var invalidAisles = dto.AisleAtColumns
                .Where(col => col < 1 || col > dto.TotalColumns)
                .ToList();
            if (invalidAisles.Any())
                throw new UserFriendlyException(
                    $"Lối đi ở cột {string.Join(", ", invalidAisles)} nằm ngoài phạm vi TotalColumns ({dto.TotalColumns}).",
                    "INVALID_AISLE_COLUMNS");

            // Xóa ghế cũ (nếu có) trước khi tạo lại
            await _seatRepository.DeleteAllByRoomIdAsync(roomId);

            // Tính danh sách ColumnIndex thực sự có ghế (loại bỏ cột lối đi)
            var aisleSet = new HashSet<int>(dto.AisleAtColumns);
            var seatColumns = Enumerable.Range(1, dto.TotalColumns)
                .Where(col => !aisleSet.Contains(col))
                .ToList();

            if (!seatColumns.Any())
                throw new UserFriendlyException(
                    "Cấu hình không hợp lệ: toàn bộ cột đều là lối đi, không có chỗ cho ghế.",
                    "NO_SEAT_COLUMNS");

            // Sinh ghế theo từng hàng
            var seats = new List<Seat>();
            foreach (var rowConfig in dto.Rows)
            {
                int seatNumber = 1;
                foreach (var colIndex in seatColumns)
                {
                    seats.Add(new Seat
                    {
                        RoomId = roomId,
                        RowName = rowConfig.RowName,
                        SeatNumber = seatNumber++,   // 1, 2, 3... liên tục, bỏ qua lối đi
                        ColumnIndex = colIndex,       // vị trí vật lý thực trong grid
                        Type = rowConfig.Type
                    });
                }
            }

            await _seatRepository.AddRangeAsync(seats);

            // Trả về layout mới sau khi generate
            return new RoomSeatLayoutDto
            {
                RoomId = room.Id,
                RoomName = room.Name,
                TotalColumns = dto.TotalColumns,
                Seats = seats.Select(MapToSeatDto).ToList()
            };
        }

        // =============================================
        // CLEAR SEATS
        // =============================================
        public async Task ClearSeatsAsync(int roomId)
        {
            _ = await _roomRepository.GetByIdAsync(roomId)
                ?? throw new UserFriendlyException("Không tìm thấy phòng chiếu.", "ROOM_NOT_FOUND");

            if (await _seatRepository.HasBookedTicketsInRoomAsync(roomId))
                throw new UserFriendlyException(
                    "Không thể xóa sơ đồ ghế vì phòng này đã có vé được đặt.",
                    "ROOM_HAS_BOOKED_TICKETS");

            await _seatRepository.DeleteAllByRoomIdAsync(roomId);
        }

        // =============================================
        // Helper: Map Seat → SeatDto
        // =============================================
        private static SeatDto MapToSeatDto(Seat s) => new()
        {
            Id = s.Id,
            RowName = s.RowName,
            SeatNumber = s.SeatNumber,
            ColumnIndex = s.ColumnIndex,
            Type = s.Type
        };
    }
}

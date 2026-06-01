using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Transactions;
using backend.DTOs;
using backend.Exceptions;
using backend.Models;
using backend.Repositories.Interface;
using backend.Services.Interface;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Services.Implements
{
    public class SeatService : ISeatService
    {
        private readonly ISeatRepository _seatRepository;
        private readonly IRoomRepository _roomRepository;
        private readonly IMemoryCache _cache;

        public SeatService(ISeatRepository seatRepository, IRoomRepository roomRepository, IMemoryCache cache)
        {
            _seatRepository = seatRepository;
            _roomRepository = roomRepository;
            _cache = cache;
        }

        // =============================================
        // GET LAYOUT BY ROOM ID
        // =============================================
        public async Task<RoomSeatLayoutDto> GetLayoutByRoomIdAsync(int roomId)
        {
            string cacheKey = $"RoomLayout_{roomId}";
            if (_cache.TryGetValue(cacheKey, out RoomSeatLayoutDto cachedLayout) && cachedLayout != null)
            {
                return cachedLayout;
            }

            var room = await _roomRepository.GetByIdAsync(roomId)
                ?? throw new UserFriendlyException("Không tìm thấy phòng chiếu.", "ROOM_NOT_FOUND");

            var seats = await _seatRepository.GetByRoomIdAsync(roomId);
            var seatList = seats.ToList();

            // TotalColumns = ColumnIndex lớn nhất trong tất cả ghế
            // Nếu chưa có ghế → TotalColumns = 0
            int totalColumns = seatList.Any() ? seatList.Max(s => s.ColumnIndex) : 0;

            var layout = new RoomSeatLayoutDto
            {
                RoomId = room.Id,
                RoomName = room.Name,
                TotalColumns = totalColumns,
                Seats = seatList.Select(MapToSeatDto).ToList()
            };

            // Cache layout for 12 hours (it rarely changes)
            _cache.Set(cacheKey, layout, System.TimeSpan.FromHours(12));

            return layout;
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

            // Xóa ghế cũ và sinh ghế mới trong một Transaction để đảm bảo toàn vẹn dữ liệu
            using var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

            // Xóa ghế cũ (nếu có) trước khi tạo lại
            await _seatRepository.DeleteAllByRoomIdAsync(roomId);

            int MapToPhysicalColumn(int inputCol)
            {
                // Từ khi dùng Interactive Builder, Frontend đã map cột trực quan (Cột 1 luôn ở bên trái)
                // Nên không cần đảo ngược cấu trúc cột vật lý nữa. Việc đánh số ngược đã được xử lý bằng .Reverse() bên dưới.
                return inputCol;
            }

            // Tính danh sách ColumnIndex thực sự có ghế (loại bỏ cột lối đi đã map vật lý)
            var aisleSet = new HashSet<int>(dto.AisleAtColumns.Select(MapToPhysicalColumn));
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
                // Danh sách cột bị ẩn của riêng hàng này (map sang vật lý)
                var hiddenCols = rowConfig.HiddenColumns != null 
                    ? new HashSet<int>(rowConfig.HiddenColumns.Select(MapToPhysicalColumn)) 
                    : new HashSet<int>();

                // Lọc ra các cột hợp lệ cho hàng này (không phải lối đi, không bị ẩn)
                var validColumnsForThisRow = seatColumns
                    .Where(col => !hiddenCols.Contains(col))
                    .ToList();

                // Đảo ngược danh sách cột nếu đánh số từ phải sang trái
                if (dto.IsNumberingFromRight)
                {
                    validColumnsForThisRow.Reverse();
                }

                for (int i = 0; i < validColumnsForThisRow.Count; i++)
                {
                    int colIndex = validColumnsForThisRow[i];
                    
                    if (rowConfig.Type == "Couple")
                    {
                        // Ghế đôi (Couple) gộp 2 slot liên tiếp
                        if (i + 1 < validColumnsForThisRow.Count)
                        {
                            int nextColIndex = validColumnsForThisRow[i + 1];
                            int leftMostColIndex = Math.Min(colIndex, nextColIndex);
                            
                            seats.Add(new Seat
                            {
                                RoomId = roomId,
                                RowName = rowConfig.RowName,
                                SeatNumber = seatNumber++,
                                ColumnIndex = leftMostColIndex,
                                Type = rowConfig.Type
                            });
                            i++; // Bỏ qua slot tiếp theo vì đã gộp vào ghế đôi
                        }
                        else 
                        {
                            // Nếu chỉ còn 1 slot lẻ ở cuối hàng, vẫn tạo nhưng nó sẽ chiếm 1 ô (hoặc lọt ra ngoài lưới)
                            seats.Add(new Seat
                            {
                                RoomId = roomId,
                                RowName = rowConfig.RowName,
                                SeatNumber = seatNumber++,
                                ColumnIndex = colIndex,
                                Type = rowConfig.Type
                            });
                        }
                    }
                    else
                    {
                        seats.Add(new Seat
                        {
                            RoomId = roomId,
                            RowName = rowConfig.RowName,
                            SeatNumber = seatNumber++,
                            ColumnIndex = colIndex,
                            Type = rowConfig.Type
                        });
                    }
                }
            }

            await _seatRepository.AddRangeAsync(seats);

            // Xác nhận transaction thành công
            transaction.Complete();

            // Trả về layout mới sau khi generate
            var layout = new RoomSeatLayoutDto
            {
                RoomId = room.Id,
                RoomName = room.Name,
                TotalColumns = dto.TotalColumns,
                Seats = seats.Select(MapToSeatDto).ToList()
            };

            // Cập nhật Cache
            _cache.Set($"RoomLayout_{roomId}", layout, System.TimeSpan.FromHours(12));

            return layout;
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

            // Xóa Cache
            _cache.Remove($"RoomLayout_{roomId}");
        }

        // =============================================
        // TOGGLE SEAT STATUS
        // =============================================
        public async Task ToggleSeatStatusAsync(int roomId, int seatId)
        {
            var seat = await _seatRepository.GetByIdAsync(seatId)
                ?? throw new UserFriendlyException("Không tìm thấy ghế.", "SEAT_NOT_FOUND");

            if (seat.RoomId != roomId)
            {
                throw new UserFriendlyException("Ghế không thuộc phòng chiếu này.", "INVALID_SEAT_ROOM");
            }

            seat.Status = seat.Status == "Active" ? "Broken" : "Active";
            await _seatRepository.UpdateAsync(seat);

            // Xóa Cache
            _cache.Remove($"RoomLayout_{roomId}");
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
            Type = s.Type,
            Status = s.Status
        };
    }
}

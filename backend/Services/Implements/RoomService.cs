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
    public class RoomService : IRoomService
    {
        private readonly IRoomRepository _roomRepository;
        private readonly ICinemaRepository _cinemaRepository;

        public RoomService(IRoomRepository roomRepository, ICinemaRepository cinemaRepository)
        {
            _roomRepository = roomRepository;
            _cinemaRepository = cinemaRepository;
        }

        // =============================================
        // GET BY CINEMA ID
        // =============================================
        public async Task<IEnumerable<RoomDetailDto>> GetByCinemaIdAsync(int cinemaId)
        {
            // Kiểm tra rạp có tồn tại không
            var cinema = await _cinemaRepository.GetByIdAsync(cinemaId)
                ?? throw new UserFriendlyException("Không tìm thấy rạp chiếu phim.", "CINEMA_NOT_FOUND");

            var rooms = await _roomRepository.GetByCinemaIdAsync(cinemaId);
            return rooms.Select(r => MapToDetail(r, cinema.Name));
        }

        // =============================================
        // GET BY ID
        // =============================================
        public async Task<RoomDetailDto> GetByIdAsync(int id)
        {
            var room = await _roomRepository.GetByIdAsync(id)
                ?? throw new UserFriendlyException("Không tìm thấy phòng chiếu.", "ROOM_NOT_FOUND");

            return MapToDetail(room, room.Cinema.Name);
        }

        // =============================================
        // CREATE
        // =============================================
        public async Task<RoomDetailDto> CreateAsync(int cinemaId, CreateRoomDto dto)
        {
            // Kiểm tra rạp có tồn tại không
            var cinema = await _cinemaRepository.GetByIdAsync(cinemaId)
                ?? throw new UserFriendlyException("Không tìm thấy rạp chiếu phim.", "CINEMA_NOT_FOUND");

            // Kiểm tra tên phòng đã tồn tại trong rạp này chưa
            if (await _roomRepository.ExistsByNameInCinemaAsync(cinemaId, dto.Name))
                throw new UserFriendlyException(
                    $"Phòng chiếu \"{dto.Name}\" đã tồn tại trong rạp này.",
                    "ROOM_NAME_EXISTS");

            var room = new Room
            {
                CinemaId = cinemaId,
                Name = dto.Name
            };

            var created = await _roomRepository.AddAsync(room);

            // Gán Cinema để map DTO (tránh query thêm)
            created.Cinema = cinema;
            return MapToDetail(created, cinema.Name);
        }

        // =============================================
        // UPDATE
        // =============================================
        public async Task<RoomDetailDto> UpdateAsync(int id, UpdateRoomDto dto)
        {
            var room = await _roomRepository.GetByIdAsync(id)
                ?? throw new UserFriendlyException("Không tìm thấy phòng chiếu.", "ROOM_NOT_FOUND");

            // Nếu có thay đổi tên thì kiểm tra trùng tên trong cùng rạp
            if (dto.Name != null && dto.Name != room.Name)
            {
                if (await _roomRepository.ExistsByNameInCinemaAsync(room.CinemaId, dto.Name, excludeId: id))
                    throw new UserFriendlyException(
                        $"Phòng chiếu \"{dto.Name}\" đã tồn tại trong rạp này.",
                        "ROOM_NAME_EXISTS");

                room.Name = dto.Name;
            }

            await _roomRepository.UpdateAsync(room);
            return MapToDetail(room, room.Cinema.Name);
        }

        // =============================================
        // DELETE
        // =============================================
        public async Task DeleteAsync(int id)
        {
            var room = await _roomRepository.GetByIdAsync(id)
                ?? throw new UserFriendlyException("Không tìm thấy phòng chiếu.", "ROOM_NOT_FOUND");

            // Từ chối xóa nếu phòng đang có ghế
            if (room.Seats.Any())
                throw new UserFriendlyException(
                    "Không thể xóa phòng chiếu đang có ghế. Hãy xóa tất cả ghế trước.",
                    "ROOM_HAS_SEATS");

            // Từ chối xóa nếu phòng đang có suất chiếu
            if (room.Showtimes.Any())
                throw new UserFriendlyException(
                    "Không thể xóa phòng chiếu đang có lịch chiếu phim.",
                    "ROOM_HAS_SHOWTIMES");

            await _roomRepository.DeleteAsync(room);
        }

        // =============================================
        // Helper: Map Room → RoomDetailDto
        // =============================================
        private static RoomDetailDto MapToDetail(Room room, string cinemaName) => new()
        {
            Id = room.Id,
            CinemaId = room.CinemaId,
            CinemaName = cinemaName,
            Name = room.Name,
            TotalSeats = room.Seats?.Count ?? 0
        };
    }
}

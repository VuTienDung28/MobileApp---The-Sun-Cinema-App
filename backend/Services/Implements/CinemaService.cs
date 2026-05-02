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
    public class CinemaService : ICinemaService
    {
        private readonly ICinemaRepository _cinemaRepository;

        public CinemaService(ICinemaRepository cinemaRepository)
        {
            _cinemaRepository = cinemaRepository;
        }

        // =============================================
        // GET ALL
        // =============================================
        public async Task<IEnumerable<CinemaListItemDto>> GetAllAsync()
        {
            var cinemas = await _cinemaRepository.GetAllAsync();
            return cinemas.Select(MapToListItem);
        }

        // =============================================
        // GET BY ID
        // =============================================
        public async Task<CinemaDetailDto> GetByIdAsync(int id)
        {
            var cinema = await _cinemaRepository.GetByIdAsync(id)
                ?? throw new UserFriendlyException("Không tìm thấy rạp chiếu phim.", "CINEMA_NOT_FOUND");

            return MapToDetail(cinema);
        }

        // =============================================
        // CREATE
        // =============================================
        public async Task<CinemaDetailDto> CreateAsync(CreateCinemaDto dto)
        {
            if (await _cinemaRepository.ExistsByNameAsync(dto.Name))
                throw new UserFriendlyException("Tên rạp chiếu phim đã tồn tại.", "CINEMA_NAME_EXISTS");

            var cinema = new Cinema
            {
                Name = dto.Name,
                Address = dto.Address
            };

            var created = await _cinemaRepository.AddAsync(cinema);
            return MapToDetail(created);
        }

        // =============================================
        // UPDATE
        // =============================================
        public async Task<CinemaDetailDto> UpdateAsync(int id, UpdateCinemaDto dto)
        {
            var cinema = await _cinemaRepository.GetByIdAsync(id)
                ?? throw new UserFriendlyException("Không tìm thấy rạp chiếu phim.", "CINEMA_NOT_FOUND");

            if (dto.Name != null && dto.Name != cinema.Name)
            {
                if (await _cinemaRepository.ExistsByNameAsync(dto.Name, excludeId: id))
                    throw new UserFriendlyException("Tên rạp chiếu phim đã tồn tại.", "CINEMA_NAME_EXISTS");

                cinema.Name = dto.Name;
            }

            if (dto.Address != null)
            {
                cinema.Address = dto.Address;
            }

            await _cinemaRepository.UpdateAsync(cinema);
            return MapToDetail(cinema);
        }

        // =============================================
        // DELETE
        // =============================================
        public async Task DeleteAsync(int id)
        {
            var cinema = await _cinemaRepository.GetByIdAsync(id)
                ?? throw new UserFriendlyException("Không tìm thấy rạp chiếu phim.", "CINEMA_NOT_FOUND");

            if (cinema.Rooms.Any())
                throw new UserFriendlyException(
                    "Không thể xóa rạp chiếu phim đang có phòng chiếu. Hãy xóa các phòng chiếu trước.",
                    "CINEMA_HAS_ROOMS");

            await _cinemaRepository.DeleteAsync(cinema);
        }

        // =============================================
        // Helpers: Map Cinema → DTO
        // =============================================
        private static CinemaListItemDto MapToListItem(Cinema c) => new()
        {
            Id = c.Id,
            Name = c.Name,
            Address = c.Address
        };

        private static CinemaDetailDto MapToDetail(Cinema c) => new()
        {
            Id = c.Id,
            Name = c.Name,
            Address = c.Address,
            Rooms = c.Rooms.Select(r => new RoomInCinemaDto
            {
                Id = r.Id,
                Name = r.Name
            }).ToList()
        };
    }
}

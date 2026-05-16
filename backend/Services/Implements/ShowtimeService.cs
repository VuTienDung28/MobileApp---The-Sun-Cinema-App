using System;
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
    public class ShowtimeService : IShowtimeService
    {
        private readonly IShowtimeRepository _showtimeRepository;
        private readonly IMovieRepository _movieRepository;
        private readonly IRoomRepository _roomRepository;

        // Buffer thêm vào sau EndTime khi check conflict (phút dọn phòng)
        private const int BufferMinutes = 15;

        public ShowtimeService(
            IShowtimeRepository showtimeRepository,
            IMovieRepository movieRepository,
            IRoomRepository roomRepository)
        {
            _showtimeRepository = showtimeRepository;
            _movieRepository = movieRepository;
            _roomRepository = roomRepository;
        }

        // =============================================
        // GET BY ID
        // =============================================
        public async Task<ShowtimeDetailDto> GetByIdAsync(int id)
        {
            var showtime = await _showtimeRepository.GetByIdAsync(id)
                ?? throw new UserFriendlyException("Không tìm thấy suất chiếu.", "SHOWTIME_NOT_FOUND");

            var bookedSeats = await _showtimeRepository.CountBookedSeatsAsync(id);
            return MapToDetail(showtime, bookedSeats);
        }

        // =============================================
        // GET BY MOVIE AND DATE
        // Trả về danh sách nhóm theo rạp
        // =============================================
        public async Task<IEnumerable<ShowtimesByCinemaDto>> GetByMovieAndDateAsync(int movieId, DateTime date)
        {
            var showtimes = await _showtimeRepository.GetByMovieAndDateAsync(movieId, date);
            var showtimeList = showtimes.ToList();

            if (!showtimeList.Any())
                return Enumerable.Empty<ShowtimesByCinemaDto>();

            var result = new List<ShowtimesByCinemaDto>();

            // Group theo Cinema (chạy tuần tự để tránh lỗi DbContext đa luồng)
            foreach (var cinemaGroup in showtimeList.GroupBy(s => s.Room.CinemaId))
            {
                var cinema = cinemaGroup.First().Room.Cinema;
                var slots = new List<ShowtimeSlotDto>();

                foreach (var s in cinemaGroup)
                {
                    var booked = await _showtimeRepository.CountBookedSeatsAsync(s.Id);
                    slots.Add(MapToSlot(s, booked));
                }

                result.Add(new ShowtimesByCinemaDto
                {
                    CinemaId = cinema.Id,
                    CinemaName = cinema.Name,
                    CinemaAddress = cinema.Address,
                    Showtimes = slots.OrderBy(s => s.StartTime).ToList()
                });
            }

            return result;
        }

        // =============================================
        // GET BY CINEMA AND DATE
        // Trả về danh sách nhóm theo phim
        // =============================================
        public async Task<IEnumerable<ShowtimesByMovieDto>> GetByCinemaAndDateAsync(int cinemaId, DateTime date)
        {
            var showtimes = await _showtimeRepository.GetByCinemaAndDateAsync(cinemaId, date);
            var showtimeList = showtimes.ToList();

            if (!showtimeList.Any())
                return Enumerable.Empty<ShowtimesByMovieDto>();

            var result = new List<ShowtimesByMovieDto>();

            // Group theo Movie (chạy tuần tự để tránh lỗi DbContext đa luồng)
            foreach (var movieGroup in showtimeList.GroupBy(s => s.Movie.Id))
            {
                var movie = movieGroup.First().Movie;
                var slots = new List<ShowtimeSlotDto>();

                foreach (var s in movieGroup)
                {
                    var booked = await _showtimeRepository.CountBookedSeatsAsync(s.Id);
                    slots.Add(MapToSlot(s, booked));
                }

                result.Add(new ShowtimesByMovieDto
                {
                    MovieId = movie.Id,
                    MovieTitle = movie.Title,
                    MovieThumbnailUrl = movie.ThumbnailPosterUrl,
                    MovieDuration = movie.Duration,
                    AgeRestriction = movie.AgeRestriction,
                    Showtimes = slots.OrderBy(s => s.StartTime).ToList()
                });
            }

            return result;
        }

        // =============================================
        // CREATE
        // =============================================
        public async Task<ShowtimeDetailDto> CreateAsync(CreateShowtimeDto dto)
        {
            // Kiểm tra phim tồn tại
            var movie = await _movieRepository.GetByIdAsync(dto.MovieId)
                ?? throw new UserFriendlyException("Không tìm thấy phim.", "MOVIE_NOT_FOUND");

            // Kiểm tra phòng tồn tại
            var room = await _roomRepository.GetByIdAsync(dto.RoomId)
                ?? throw new UserFriendlyException("Không tìm thấy phòng chiếu.", "ROOM_NOT_FOUND");

            // Kiểm tra phòng có ghế chưa
            if (!room.Seats.Any())
                throw new UserFriendlyException(
                    "Phòng chiếu chưa được cài đặt sơ đồ ghế. Hãy tạo ghế trước khi thêm suất chiếu.",
                    "ROOM_HAS_NO_SEATS");

            // Kiểm tra StartTime phải ở tương lai
            if (dto.StartTime <= DateTime.UtcNow)
                throw new UserFriendlyException(
                    "Giờ bắt đầu suất chiếu phải ở trong tương lai.",
                    "SHOWTIME_INVALID_START_TIME");

            // Tính EndTime = StartTime + Duration(phim) + 15p buffer
            var endTime = dto.StartTime.AddMinutes(movie.Duration + BufferMinutes);

            // Kiểm tra conflict lịch trong phòng
            if (await _showtimeRepository.HasConflictAsync(dto.RoomId, dto.StartTime, endTime))
                throw new UserFriendlyException(
                    $"Phòng {room.Name} đã có suất chiếu khác trong khung giờ này (bao gồm 15 phút dọn phòng). Vui lòng chọn giờ khác.",
                    "SHOWTIME_CONFLICT");

            var showtime = new Showtime
            {
                MovieId = dto.MovieId,
                RoomId = dto.RoomId,
                StartTime = dto.StartTime,
                BasePrice = dto.BasePrice
            };

            var created = await _showtimeRepository.AddAsync(showtime);

            // Reload đầy đủ navigation để map DTO
            var full = await _showtimeRepository.GetByIdAsync(created.Id)
                ?? throw new Exception("Lỗi khi tải suất chiếu vừa tạo.");

            return MapToDetail(full, bookedSeats: 0);
        }

        // =============================================
        // UPDATE
        // =============================================
        public async Task<ShowtimeDetailDto> UpdateAsync(int id, UpdateShowtimeDto dto)
        {
            var showtime = await _showtimeRepository.GetByIdAsync(id)
                ?? throw new UserFriendlyException("Không tìm thấy suất chiếu.", "SHOWTIME_NOT_FOUND");

            // Nếu có thay đổi giờ chiếu
            if (dto.StartTime.HasValue)
            {
                if (dto.StartTime.Value <= DateTime.UtcNow)
                    throw new UserFriendlyException(
                        "Giờ bắt đầu mới phải ở trong tương lai.",
                        "SHOWTIME_INVALID_START_TIME");

                var endTime = dto.StartTime.Value.AddMinutes(showtime.Movie.Duration + BufferMinutes);

                // Check conflict, loại trừ chính suất chiếu đang update
                if (await _showtimeRepository.HasConflictAsync(showtime.RoomId, dto.StartTime.Value, endTime, excludeId: id))
                    throw new UserFriendlyException(
                        $"Phòng {showtime.Room.Name} đã có suất chiếu khác trong khung giờ này. Vui lòng chọn giờ khác.",
                        "SHOWTIME_CONFLICT");

                showtime.StartTime = dto.StartTime.Value;
            }

            if (dto.BasePrice.HasValue)
                showtime.BasePrice = dto.BasePrice.Value;

            await _showtimeRepository.UpdateAsync(showtime);

            var bookedSeats = await _showtimeRepository.CountBookedSeatsAsync(id);
            return MapToDetail(showtime, bookedSeats);
        }

        // =============================================
        // DELETE
        // =============================================
        public async Task DeleteAsync(int id)
        {
            var showtime = await _showtimeRepository.GetByIdAsync(id)
                ?? throw new UserFriendlyException("Không tìm thấy suất chiếu.", "SHOWTIME_NOT_FOUND");

            // Từ chối xóa nếu đã có booking
            if (showtime.Bookings.Any())
                throw new UserFriendlyException(
                    "Không thể xóa suất chiếu đã có vé đặt.",
                    "SHOWTIME_HAS_BOOKINGS");

            await _showtimeRepository.DeleteAsync(showtime);
        }

        // =============================================
        // Helpers
        // =============================================

        private static DateTime CalculateEndTime(Showtime s)
            => s.StartTime.AddMinutes(s.Movie.Duration + BufferMinutes);

        private static ShowtimeDetailDto MapToDetail(Showtime s, int bookedSeats)
        {
            var totalSeats = s.Room.Seats?.Count ?? 0;
            return new ShowtimeDetailDto
            {
                Id = s.Id,
                MovieId = s.MovieId,
                MovieTitle = s.Movie.Title,
                MovieThumbnailUrl = s.Movie.ThumbnailPosterUrl,
                MovieDuration = s.Movie.Duration,
                RoomId = s.RoomId,
                RoomName = s.Room.Name,
                CinemaId = s.Room.CinemaId,
                CinemaName = s.Room.Cinema.Name,
                CinemaAddress = s.Room.Cinema.Address,
                StartTime = s.StartTime,
                EndTime = CalculateEndTime(s),
                BasePrice = s.BasePrice,
                TotalSeats = totalSeats,
                AvailableSeats = totalSeats - bookedSeats
            };
        }

        private static ShowtimeSlotDto MapToSlot(Showtime s, int bookedSeats)
        {
            var totalSeats = s.Room.Seats?.Count ?? 0;
            return new ShowtimeSlotDto
            {
                Id = s.Id,
                StartTime = s.StartTime,
                EndTime = CalculateEndTime(s),
                BasePrice = s.BasePrice,
                RoomId = s.RoomId,
                RoomName = s.Room.Name,
                AvailableSeats = totalSeats - bookedSeats
            };
        }
    }
}

using backend.DTOs;
using backend.Exceptions;
using backend.Models;
using backend.Repositories.Interface;
using backend.Services.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace backend.Services.Implements
{
    public class MovieService : IMovieService
    {
        private readonly IMovieRepository _movieRepository;
        private readonly IStorageService  _storageService;
        private readonly MinIOOptions     _minioOptions;

        public MovieService(
            IMovieRepository movieRepository,
            IStorageService storageService,
            IOptions<MinIOOptions> minioOptions)
        {
            _movieRepository = movieRepository;
            _storageService  = storageService;
            _minioOptions    = minioOptions.Value;
        }

        // =============================================
        // GET /api/movie
        // =============================================
        public async Task<IEnumerable<MovieListItemDto>> GetAllAsync()
        {
            var movies = await _movieRepository.GetAllAsync();
            return movies.Select(MapToListItem);
        }

        // =============================================
        // GET /api/movie/now-showing
        // =============================================
        public async Task<IEnumerable<MovieListItemDto>> GetNowShowingAsync()
        {
            var movies = await _movieRepository.GetNowShowingAsync();
            return movies.Select(MapToListItem);
        }

        // =============================================
        // GET /api/movie/coming-soon
        // =============================================
        public async Task<IEnumerable<MovieListItemDto>> GetComingSoonAsync()
        {
            var movies = await _movieRepository.GetComingSoonAsync();
            return movies.Select(MapToListItem);
        }

        // =============================================
        // GET /api/movie/{id}
        // =============================================
        public async Task<MovieDetailDto> GetByIdAsync(int id)
        {
            var movie = await _movieRepository.GetByIdAsync(id)
                ?? throw new UserFriendlyException("Không tìm thấy phim.", "MOVIE_NOT_FOUND");

            return MapToDetail(movie);
        }

        // =============================================
        // POST /api/movie
        // =============================================
        public async Task<MovieDetailDto> CreateAsync(CreateMovieDto dto)
        {
            // Kiểm tra tên phim trùng
            if (await _movieRepository.ExistsByTitleAsync(dto.Title))
                throw new UserFriendlyException("Tên phim đã tồn tại.", "MOVIE_TITLE_EXISTS");

            var movie = new Movie
            {
                Title          = dto.Title,
                Description    = dto.Description,
                Duration       = dto.Duration,
                ReleaseDate    = dto.ReleaseDate,
                AgeRestriction = dto.AgeRestriction,
                MovieGenre     = dto.MovieGenre,
                Language       = dto.Language,
                MovieActors    = dto.MovieActors,
                Director       = dto.Director,
                Rating         = 0,
                TotalReactions = 0
            };

            var created = await _movieRepository.AddAsync(movie);
            return MapToDetail(created);
        }

        // =============================================
        // PUT /api/movie/{id}
        // =============================================
        public async Task<MovieDetailDto> UpdateAsync(int id, UpdateMovieDto dto)
        {
            var movie = await _movieRepository.GetByIdAsync(id)
                ?? throw new UserFriendlyException("Không tìm thấy phim.", "MOVIE_NOT_FOUND");

            // Kiểm tra tên mới có trùng với phim khác không
            if (dto.Title != null && dto.Title != movie.Title)
            {
                if (await _movieRepository.ExistsByTitleAsync(dto.Title, excludeId: id))
                    throw new UserFriendlyException("Tên phim đã tồn tại.", "MOVIE_TITLE_EXISTS");

                movie.Title = dto.Title;
            }

            // Chỉ cập nhật những trường được gửi lên (không null)
            if (dto.Description  != null) movie.Description    = dto.Description;
            if (dto.Duration     != null) movie.Duration       = dto.Duration.Value;
            if (dto.ReleaseDate  != null) movie.ReleaseDate    = dto.ReleaseDate.Value;
            if (dto.AgeRestriction != null) movie.AgeRestriction = dto.AgeRestriction;
            if (dto.MovieGenre   != null) movie.MovieGenre     = dto.MovieGenre;
            if (dto.Language     != null) movie.Language       = dto.Language;
            if (dto.MovieActors  != null) movie.MovieActors    = dto.MovieActors;
            if (dto.Director     != null) movie.Director       = dto.Director;

            await _movieRepository.UpdateAsync(movie);
            return MapToDetail(movie);
        }

        // =============================================
        // DELETE /api/movie/{id}
        // =============================================
        public async Task DeleteAsync(int id)
        {
            var movie = await _movieRepository.GetByIdAsync(id)
                ?? throw new UserFriendlyException("Không tìm thấy phim.", "MOVIE_NOT_FOUND");

            // Từ chối xóa nếu phim còn lịch chiếu
            if (movie.Showtimes.Any())
                throw new UserFriendlyException(
                    "Không thể xóa phim đang có lịch chiếu. Hãy xóa lịch chiếu trước.",
                    "MOVIE_HAS_SHOWTIMES");

            // Xóa poster cũ trên MinIO nếu có
            if (!string.IsNullOrEmpty(movie.ThumbnailPosterUrl))
                await _storageService.DeleteAsync(movie.ThumbnailPosterUrl);

            if (!string.IsNullOrEmpty(movie.BackdropPosterUrl))
                await _storageService.DeleteAsync(movie.BackdropPosterUrl);

            await _movieRepository.DeleteAsync(movie);
        }

        // =============================================
        // PUT /api/movie/{id}/thumbnail
        // =============================================
        public async Task<UploadPosterResponseDto> UploadThumbnailAsync(int id, IFormFile file)
        {
            var movie = await _movieRepository.GetByIdAsync(id)
                ?? throw new UserFriendlyException("Không tìm thấy phim.", "MOVIE_NOT_FOUND");

            // Xóa thumbnail cũ nếu có
            if (!string.IsNullOrEmpty(movie.ThumbnailPosterUrl))
                await _storageService.DeleteAsync(movie.ThumbnailPosterUrl);

            // Upload mới — lưu trong thư mục thumbnails/
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var objectKey = $"thumbnails/{id}_{timestamp}.webp";
            var relativePath = await _storageService.UploadAsync(file, _minioOptions.MovieBucketName, objectKey, 300, 450);

            movie.ThumbnailPosterUrl = relativePath;
            await _movieRepository.UpdateAsync(movie);

            return new UploadPosterResponseDto { RelativePath = relativePath };
        }

        // =============================================
        // PUT /api/movie/{id}/backdrop
        // =============================================
        public async Task<UploadPosterResponseDto> UploadBackdropAsync(int id, IFormFile file)
        {
            var movie = await _movieRepository.GetByIdAsync(id)
                ?? throw new UserFriendlyException("Không tìm thấy phim.", "MOVIE_NOT_FOUND");

            // Xóa backdrop cũ nếu có
            if (!string.IsNullOrEmpty(movie.BackdropPosterUrl))
                await _storageService.DeleteAsync(movie.BackdropPosterUrl);

            // Upload mới — lưu trong thư mục backdrops/
            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var objectKey = $"backdrops/{id}_{timestamp}.webp";
            var relativePath = await _storageService.UploadAsync(file, _minioOptions.MovieBucketName, objectKey, 1280, 720);

            movie.BackdropPosterUrl = relativePath;
            await _movieRepository.UpdateAsync(movie);

            return new UploadPosterResponseDto { RelativePath = relativePath };
        }

        // =============================================
        // Helpers: Map Movie → DTO
        // =============================================
        private static MovieListItemDto MapToListItem(Movie m) => new()
        {
            Id                 = m.Id,
            Title              = m.Title,
            Duration           = m.Duration,
            ReleaseDate        = m.ReleaseDate,
            ThumbnailPosterUrl = m.ThumbnailPosterUrl,
            AgeRestriction     = m.AgeRestriction,
            MovieGenre         = m.MovieGenre,
            Language           = m.Language,
            Rating             = m.Rating,
            TotalReactions     = m.TotalReactions
        };

        private static MovieDetailDto MapToDetail(Movie m) => new()
        {
            Id                 = m.Id,
            Title              = m.Title,
            Description        = m.Description,
            Duration           = m.Duration,
            ReleaseDate        = m.ReleaseDate,
            ThumbnailPosterUrl = m.ThumbnailPosterUrl,
            BackdropPosterUrl  = m.BackdropPosterUrl,
            AgeRestriction     = m.AgeRestriction,
            MovieGenre         = m.MovieGenre,
            Language           = m.Language,
            Rating             = m.Rating,
            TotalReactions     = m.TotalReactions,
            MovieActors        = m.MovieActors,
            Director           = m.Director
        };
    }
}

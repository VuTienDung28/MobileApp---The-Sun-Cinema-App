using backend.DTOs;
using backend.Exceptions;
using backend.Models;
using backend.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/movie")]
public class MovieController : ControllerBase
{
    private readonly IMovieService _movieService;

    public MovieController(IMovieService movieService)
    {
        _movieService = movieService;
    }

    // =============================================
    // GET /api/movie
    // Lấy toàn bộ danh sách phim (public)
    // =============================================
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var result = await _movieService.GetAllAsync();
            return Ok(ApiResponse<IEnumerable<MovieListItemDto>>.Success(result, "Lấy danh sách phim thành công", "GET_MOVIES_SUCCESS"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Failure("SERVER_ERROR", "Lỗi hệ thống khi lấy danh sách phim.", ex.Message));
        }
    }

    // =============================================
    // GET /api/movie/now-showing
    // Phim đang chiếu — có Showtime trong 7 ngày tới (public)
    // =============================================
    [HttpGet("now-showing")]
    public async Task<IActionResult> GetNowShowing()
    {
        try
        {
            var result = await _movieService.GetNowShowingAsync();
            return Ok(ApiResponse<IEnumerable<MovieListItemDto>>.Success(result, "Lấy phim đang chiếu thành công", "GET_NOW_SHOWING_SUCCESS"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Failure("SERVER_ERROR", "Lỗi hệ thống khi lấy phim đang chiếu.", ex.Message));
        }
    }

    // =============================================
    // GET /api/movie/coming-soon
    // Phim sắp chiếu — chưa có Showtime (public)
    // =============================================
    [HttpGet("coming-soon")]
    public async Task<IActionResult> GetComingSoon()
    {
        try
        {
            var result = await _movieService.GetComingSoonAsync();
            return Ok(ApiResponse<IEnumerable<MovieListItemDto>>.Success(result, "Lấy phim sắp chiếu thành công", "GET_COMING_SOON_SUCCESS"));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Failure("SERVER_ERROR", "Lỗi hệ thống khi lấy phim sắp chiếu.", ex.Message));
        }
    }

    // =============================================
    // GET /api/movie/{id}
    // Chi tiết một phim (public)
    // =============================================
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var result = await _movieService.GetByIdAsync(id);
            return Ok(ApiResponse<MovieDetailDto>.Success(result, "Lấy chi tiết phim thành công", "GET_MOVIE_SUCCESS"));
        }
        catch (UserFriendlyException ex)
        {
            return BadRequest(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Failure("SERVER_ERROR", "Lỗi hệ thống khi lấy chi tiết phim.", ex.Message));
        }
    }

    // =============================================
    // POST /api/movie
    // Tạo phim mới (Admin only)
    // =============================================
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Create([FromBody] CreateMovieDto dto)
    {
        try
        {
            var result = await _movieService.CreateAsync(dto);
            return StatusCode(201, ApiResponse<MovieDetailDto>.Success(result, "Tạo phim thành công", "CREATE_MOVIE_SUCCESS"));
        }
        catch (UserFriendlyException ex)
        {
            return BadRequest(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Failure("SERVER_ERROR", "Lỗi hệ thống khi tạo phim.", ex.Message));
        }
    }

    // =============================================
    // PUT /api/movie/{id}
    // Cập nhật thông tin phim (Admin only)
    // =============================================
    [HttpPut("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateMovieDto dto)
    {
        try
        {
            var result = await _movieService.UpdateAsync(id, dto);
            return Ok(ApiResponse<MovieDetailDto>.Success(result, "Cập nhật phim thành công", "UPDATE_MOVIE_SUCCESS"));
        }
        catch (UserFriendlyException ex)
        {
            return BadRequest(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Failure("SERVER_ERROR", "Lỗi hệ thống khi cập nhật phim.", ex.Message));
        }
    }

    // =============================================
    // DELETE /api/movie/{id}
    // Xóa phim — từ chối nếu còn Showtime (Admin only)
    // =============================================
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _movieService.DeleteAsync(id);
            return Ok(ApiResponse<string>.Success(null, "Xóa phim thành công", "DELETE_MOVIE_SUCCESS"));
        }
        catch (UserFriendlyException ex)
        {
            return BadRequest(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Failure("SERVER_ERROR", "Lỗi hệ thống khi xóa phim.", ex.Message));
        }
    }

    // =============================================
    // PUT /api/movie/{id}/thumbnail
    // Upload poster nhỏ lên MinIO (Admin only)
    // =============================================
    [HttpPut("{id:int}/thumbnail")]
    [Authorize(Policy = "AdminOnly")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadThumbnail(int id, [FromForm] UploadPosterRequestDto request)
    {
        try
        {
            var result = await _movieService.UploadThumbnailAsync(id, request.File);
            return Ok(ApiResponse<UploadPosterResponseDto>.Success(result, "Upload thumbnail thành công", "UPLOAD_THUMBNAIL_SUCCESS"));
        }
        catch (UserFriendlyException ex)
        {
            return BadRequest(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Failure("SERVER_ERROR", "Lỗi hệ thống khi upload thumbnail.", ex.Message));
        }
    }

    // =============================================
    // PUT /api/movie/{id}/backdrop
    // Upload poster nền lớn lên MinIO (Admin only)
    // =============================================
    [HttpPut("{id:int}/backdrop")]
    [Authorize(Policy = "AdminOnly")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadBackdrop(int id, [FromForm] UploadPosterRequestDto request)
    {
        try
        {
            var result = await _movieService.UploadBackdropAsync(id, request.File);
            return Ok(ApiResponse<UploadPosterResponseDto>.Success(result, "Upload backdrop thành công", "UPLOAD_BACKDROP_SUCCESS"));
        }
        catch (UserFriendlyException ex)
        {
            return BadRequest(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.Failure("SERVER_ERROR", "Lỗi hệ thống khi upload backdrop.", ex.Message));
        }
    }
}

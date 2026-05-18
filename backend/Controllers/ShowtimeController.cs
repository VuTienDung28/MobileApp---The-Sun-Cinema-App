using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Exceptions;
using backend.Models;
using backend.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/showtime")]
    public class ShowtimeController : ControllerBase
    {
        private readonly IShowtimeService _showtimeService;

        public ShowtimeController(IShowtimeService showtimeService)
        {
            _showtimeService = showtimeService;
        }

        // =============================================
        // GET /api/showtime/detail/{id}
        // Chi tiết 1 suất chiếu (public)
        // =============================================
        [HttpGet("detail/{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _showtimeService.GetByIdAsync(id);
                return Ok(ApiResponse<ShowtimeDetailDto>.Success(
                    result,
                    "Lấy chi tiết suất chiếu thành công",
                    "GET_SHOWTIME_SUCCESS"));
            }
            catch (UserFriendlyException ex)
            {
                return NotFound(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failure(
                    "SERVER_ERROR", "Lỗi hệ thống khi lấy chi tiết suất chiếu.", ex.Message));
            }
        }

        // =============================================
        // GET /api/showtime/by-movie/{movieId}?date=yyyy-MM-dd
        // Suất chiếu của 1 phim theo ngày — nhóm theo rạp (public)
        // Nếu không truyền date → mặc định ngày hôm nay
        // =============================================
        [HttpGet("by-movie/{movieId:int}")]
        public async Task<IActionResult> GetByMovie(int movieId, [FromQuery] DateTime? date)
        {
            try
            {
                var queryDate = date?.Date ?? DateTime.Today;
                var result = await _showtimeService.GetByMovieAndDateAsync(movieId, queryDate);
                return Ok(ApiResponse<IEnumerable<ShowtimesByCinemaDto>>.Success(
                    result,
                    $"Lấy suất chiếu ngày {queryDate:dd/MM/yyyy} thành công",
                    "GET_SHOWTIMES_BY_MOVIE_SUCCESS"));
            }
            catch (UserFriendlyException ex)
            {
                return NotFound(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failure(
                    "SERVER_ERROR", "Lỗi hệ thống khi lấy suất chiếu theo phim.", ex.Message));
            }
        }

        // =============================================
        // GET /api/showtime/by-cinema/{cinemaId}?date=yyyy-MM-dd
        // Suất chiếu của 1 rạp theo ngày — nhóm theo phim (public)
        // Nếu không truyền date → mặc định ngày hôm nay
        // =============================================
        [HttpGet("by-cinema/{cinemaId:int}")]
        public async Task<IActionResult> GetByCinema(int cinemaId, [FromQuery] DateTime? date)
        {
            try
            {
                var queryDate = date?.Date ?? DateTime.Today;
                var result = await _showtimeService.GetByCinemaAndDateAsync(cinemaId, queryDate);
                return Ok(ApiResponse<IEnumerable<ShowtimesByMovieDto>>.Success(
                    result,
                    $"Lấy lịch chiếu ngày {queryDate:dd/MM/yyyy} thành công",
                    "GET_SHOWTIMES_BY_CINEMA_SUCCESS"));
            }
            catch (UserFriendlyException ex)
            {
                return NotFound(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failure(
                    "SERVER_ERROR", "Lỗi hệ thống khi lấy lịch chiếu theo rạp.", ex.Message));
            }
        }

        // =============================================
        // GET /api/showtime/{id}/seats/status
        // Lấy danh sách SeatId đã bị đặt hoặc đang được giữ (Pending)
        // =============================================
        [HttpGet("{id:int}/seats/status")]
        public async Task<IActionResult> GetSeatStatus(int id)
        {
            try
            {
                var result = await _showtimeService.GetSeatStatusAsync(id);
                return Ok(ApiResponse<IEnumerable<int>>.Success(
                    result,
                    "Lấy trạng thái ghế thành công",
                    "GET_SEAT_STATUS_SUCCESS"));
            }
            catch (UserFriendlyException ex)
            {
                return NotFound(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failure(
                    "SERVER_ERROR", "Lỗi hệ thống khi lấy trạng thái ghế.", ex.Message));
            }
        }

        // =============================================
        // POST /api/showtime
        // Tạo suất chiếu mới (Admin only)
        //
        // Body ví dụ:
        // {
        //   "movieId": 1,
        //   "roomId": 5,
        //   "startTime": "2026-05-10T09:30:00",
        //   "basePrice": 90000
        // }
        // =============================================
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Create([FromBody] CreateShowtimeDto dto)
        {
            try
            {
                var result = await _showtimeService.CreateAsync(dto);
                return StatusCode(201, ApiResponse<ShowtimeDetailDto>.Success(
                    result,
                    "Tạo suất chiếu thành công",
                    "CREATE_SHOWTIME_SUCCESS"));
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failure(
                    "SERVER_ERROR", "Lỗi hệ thống khi tạo suất chiếu.", ex.Message));
            }
        }

        // =============================================
        // PUT /api/showtime/update/{id}
        // Cập nhật giờ chiếu hoặc giá vé (Admin only)
        // =============================================
        [HttpPut("update/{id:int}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateShowtimeDto dto)
        {
            try
            {
                var result = await _showtimeService.UpdateAsync(id, dto);
                return Ok(ApiResponse<ShowtimeDetailDto>.Success(
                    result,
                    "Cập nhật suất chiếu thành công",
                    "UPDATE_SHOWTIME_SUCCESS"));
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failure(
                    "SERVER_ERROR", "Lỗi hệ thống khi cập nhật suất chiếu.", ex.Message));
            }
        }

        // =============================================
        // DELETE /api/showtime/delete/{id}
        // Xóa suất chiếu (Admin only)
        // Từ chối nếu đã có booking
        // =============================================
        [HttpDelete("delete/{id:int}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _showtimeService.DeleteAsync(id);
                return Ok(ApiResponse<string>.Success(
                    null,
                    "Xóa suất chiếu thành công",
                    "DELETE_SHOWTIME_SUCCESS"));
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failure(
                    "SERVER_ERROR", "Lỗi hệ thống khi xóa suất chiếu.", ex.Message));
            }
        }
    }
}

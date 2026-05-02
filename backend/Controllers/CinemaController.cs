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
    [Route("api/cinema")]
    public class CinemaController : ControllerBase
    {
        private readonly ICinemaService _cinemaService;

        public CinemaController(ICinemaService cinemaService)
        {
            _cinemaService = cinemaService;
        }

        // =============================================
        // GET /api/cinema
        // Lấy toàn bộ danh sách rạp chiếu phim (public)
        // =============================================
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _cinemaService.GetAllAsync();
                return Ok(ApiResponse<IEnumerable<CinemaListItemDto>>.Success(result, "Lấy danh sách rạp chiếu phim thành công", "GET_CINEMAS_SUCCESS"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failure("SERVER_ERROR", "Lỗi hệ thống khi lấy danh sách rạp chiếu phim.", ex.Message));
            }
        }

        // =============================================
        // GET /api/cinema/detail/{id}
        // Chi tiết một rạp chiếu phim (public)
        // =============================================
        [HttpGet("detail/{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _cinemaService.GetByIdAsync(id);
                return Ok(ApiResponse<CinemaDetailDto>.Success(result, "Lấy chi tiết rạp chiếu phim thành công", "GET_CINEMA_SUCCESS"));
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failure("SERVER_ERROR", "Lỗi hệ thống khi lấy chi tiết rạp chiếu phim.", ex.Message));
            }
        }

        // =============================================
        // POST /api/cinema
        // Tạo rạp chiếu phim mới (Admin only)
        // =============================================
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Create([FromBody] CreateCinemaDto dto)
        {
            try
            {
                var result = await _cinemaService.CreateAsync(dto);
                return StatusCode(201, ApiResponse<CinemaDetailDto>.Success(result, "Tạo rạp chiếu phim thành công", "CREATE_CINEMA_SUCCESS"));
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failure("SERVER_ERROR", "Lỗi hệ thống khi tạo rạp chiếu phim.", ex.Message));
            }
        }

        // =============================================
        // PUT /api/cinema/update/{id}
        // Cập nhật thông tin rạp chiếu phim (Admin only)
        // =============================================
        [HttpPut("update/{id:int}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCinemaDto dto)
        {
            try
            {
                var result = await _cinemaService.UpdateAsync(id, dto);
                return Ok(ApiResponse<CinemaDetailDto>.Success(result, "Cập nhật rạp chiếu phim thành công", "UPDATE_CINEMA_SUCCESS"));
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failure("SERVER_ERROR", "Lỗi hệ thống khi cập nhật rạp chiếu phim.", ex.Message));
            }
        }

        // =============================================
        // DELETE /api/cinema/delete/{id}
        // Xóa rạp chiếu phim (Admin only)
        // =============================================
        [HttpDelete("delete/{id:int}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _cinemaService.DeleteAsync(id);
                return Ok(ApiResponse<string>.Success(null, "Xóa rạp chiếu phim thành công", "DELETE_CINEMA_SUCCESS"));
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failure("SERVER_ERROR", "Lỗi hệ thống khi xóa rạp chiếu phim.", ex.Message));
            }
        }
    }
}

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
    [Route("api/cinema/{cinemaId:int}/room")]
    public class RoomController : ControllerBase
    {
        private readonly IRoomService _roomService;

        public RoomController(IRoomService roomService)
        {
            _roomService = roomService;
        }

        // =============================================
        // GET /api/cinema/{cinemaId}/room
        // Lấy danh sách phòng chiếu của 1 rạp (public)
        // =============================================
        [HttpGet]
        public async Task<IActionResult> GetByCinema(int cinemaId)
        {
            try
            {
                var result = await _roomService.GetByCinemaIdAsync(cinemaId);
                return Ok(ApiResponse<IEnumerable<RoomDetailDto>>.Success(
                    result,
                    "Lấy danh sách phòng chiếu thành công",
                    "GET_ROOMS_SUCCESS"));
            }
            catch (UserFriendlyException ex)
            {
                return NotFound(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failure(
                    "SERVER_ERROR",
                    "Lỗi hệ thống khi lấy danh sách phòng chiếu.",
                    ex.Message));
            }
        }

        // =============================================
        // GET /api/cinema/{cinemaId}/room/detail/{id}
        // Chi tiết 1 phòng chiếu (public)
        // =============================================
        [HttpGet("detail/{id:int}")]
        public async Task<IActionResult> GetById(int cinemaId, int id)
        {
            try
            {
                var result = await _roomService.GetByIdAsync(id);
                return Ok(ApiResponse<RoomDetailDto>.Success(
                    result,
                    "Lấy chi tiết phòng chiếu thành công",
                    "GET_ROOM_SUCCESS"));
            }
            catch (UserFriendlyException ex)
            {
                return NotFound(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failure(
                    "SERVER_ERROR",
                    "Lỗi hệ thống khi lấy chi tiết phòng chiếu.",
                    ex.Message));
            }
        }

        // =============================================
        // POST /api/cinema/{cinemaId}/room
        // Tạo phòng chiếu mới trong 1 rạp (Admin only)
        // =============================================
        [HttpPost]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Create(int cinemaId, [FromBody] CreateRoomDto dto)
        {
            try
            {
                var result = await _roomService.CreateAsync(cinemaId, dto);
                return StatusCode(201, ApiResponse<RoomDetailDto>.Success(
                    result,
                    "Tạo phòng chiếu thành công",
                    "CREATE_ROOM_SUCCESS"));
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failure(
                    "SERVER_ERROR",
                    "Lỗi hệ thống khi tạo phòng chiếu.",
                    ex.Message));
            }
        }

        // =============================================
        // PUT /api/cinema/{cinemaId}/room/update/{id}
        // Cập nhật tên phòng chiếu (Admin only)
        // =============================================
        [HttpPut("update/{id:int}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Update(int cinemaId, int id, [FromBody] UpdateRoomDto dto)
        {
            try
            {
                var result = await _roomService.UpdateAsync(id, dto);
                return Ok(ApiResponse<RoomDetailDto>.Success(
                    result,
                    "Cập nhật phòng chiếu thành công",
                    "UPDATE_ROOM_SUCCESS"));
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failure(
                    "SERVER_ERROR",
                    "Lỗi hệ thống khi cập nhật phòng chiếu.",
                    ex.Message));
            }
        }

        // =============================================
        // DELETE /api/cinema/{cinemaId}/room/delete/{id}
        // Xóa phòng chiếu (Admin only)
        // =============================================
        [HttpDelete("delete/{id:int}")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(int cinemaId, int id)
        {
            try
            {
                await _roomService.DeleteAsync(id);
                return Ok(ApiResponse<string>.Success(
                    null,
                    "Xóa phòng chiếu thành công",
                    "DELETE_ROOM_SUCCESS"));
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failure(
                    "SERVER_ERROR",
                    "Lỗi hệ thống khi xóa phòng chiếu.",
                    ex.Message));
            }
        }
    }
}

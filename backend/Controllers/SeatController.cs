using System;
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
    [Route("api/cinema/{cinemaId:int}/room/{roomId:int}/seat")]
    public class SeatController : ControllerBase
    {
        private readonly ISeatService _seatService;

        public SeatController(ISeatService seatService)
        {
            _seatService = seatService;
        }

        // =============================================
        // GET /api/cinema/{cinemaId}/room/{roomId}/seat/layout
        // Lấy sơ đồ ghế của phòng chiếu (public)
        // Frontend dùng TotalColumns + Seats để dựng grid
        // =============================================
        [HttpGet("layout")]
        public async Task<IActionResult> GetLayout(int cinemaId, int roomId)
        {
            try
            {
                var result = await _seatService.GetLayoutByRoomIdAsync(roomId);
                return Ok(ApiResponse<RoomSeatLayoutDto>.Success(
                    result,
                    "Lấy sơ đồ ghế thành công",
                    "GET_SEAT_LAYOUT_SUCCESS"));
            }
            catch (UserFriendlyException ex)
            {
                return NotFound(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failure(
                    "SERVER_ERROR",
                    "Lỗi hệ thống khi lấy sơ đồ ghế.",
                    ex.Message));
            }
        }

        // =============================================
        // POST /api/cinema/{cinemaId}/room/{roomId}/seat/generate
        // Generate toàn bộ ghế theo cấu hình (Admin only)
        //
        // Request body ví dụ (9 ghế/hàng, 2 lối đi ở cột 4 và 8):
        // {
        //   "totalColumns": 11,
        //   "aisleAtColumns": [4, 8],
        //   "rows": [
        //     { "rowName": "A", "type": "Standard" },
        //     { "rowName": "B", "type": "Standard" },
        //     { "rowName": "C", "type": "VIP" }
        //   ]
        // }
        // =============================================
        [HttpPost("generate")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Generate(int cinemaId, int roomId, [FromBody] GenerateSeatsDto dto)
        {
            try
            {
                var result = await _seatService.GenerateSeatsAsync(roomId, dto);
                return StatusCode(201, ApiResponse<RoomSeatLayoutDto>.Success(
                    result,
                    $"Tạo sơ đồ ghế thành công. Tổng số ghế: {result.Seats.Count}",
                    "GENERATE_SEATS_SUCCESS"));
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failure(
                    "SERVER_ERROR",
                    "Lỗi hệ thống khi tạo sơ đồ ghế.",
                    ex.Message));
            }
        }

        // =============================================
        // DELETE /api/cinema/{cinemaId}/room/{roomId}/seat/clear
        // Xóa toàn bộ ghế của phòng chiếu (Admin only)
        // Dùng khi muốn thiết lập lại sơ đồ ghế từ đầu
        // =============================================
        [HttpDelete("clear")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Clear(int cinemaId, int roomId)
        {
            try
            {
                await _seatService.ClearSeatsAsync(roomId);
                return Ok(ApiResponse<string>.Success(
                    null,
                    "Xóa toàn bộ ghế thành công",
                    "CLEAR_SEATS_SUCCESS"));
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failure(
                    "SERVER_ERROR",
                    "Lỗi hệ thống khi xóa sơ đồ ghế.",
                    ex.Message));
            }
        }
        // =============================================
        // PUT /api/cinema/{cinemaId}/room/{roomId}/seat/{seatId}/status
        // Cập nhật trạng thái của 1 ghế (Active <-> Broken) (Admin only)
        // =============================================
        [HttpPut("{seatId:int}/status")]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> ToggleStatus(int cinemaId, int roomId, int seatId)
        {
            try
            {
                await _seatService.ToggleSeatStatusAsync(roomId, seatId);
                return Ok(ApiResponse<string>.Success(
                    null,
                    "Cập nhật trạng thái ghế thành công",
                    "TOGGLE_SEAT_STATUS_SUCCESS"));
            }
            catch (UserFriendlyException ex)
            {
                return BadRequest(ApiResponse<string>.Failure(ex.ErrorCode, ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.Failure(
                    "SERVER_ERROR",
                    "Lỗi hệ thống khi cập nhật trạng thái ghế.",
                    ex.Message));
            }
        }
    }
}

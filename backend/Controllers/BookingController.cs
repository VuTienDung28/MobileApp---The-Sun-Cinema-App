using backend.Data;
using backend.Dtos;
using backend.Models;
using backend.Services.Interface;
using backend.Exceptions;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System;
using System.Threading.Tasks;
using System.Linq;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpPost("hold")]
        public async Task<IActionResult> HoldSeats([FromBody] HoldBookingRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            try
            {
                var response = await _bookingService.HoldSeatsAsync(userId, request);
                return Ok(response);
            }
            catch (UserFriendlyException ex)
            {
                if (ex.ErrorCode == "SEAT_CONFLICT" && ex.Data.Contains("ConflictSeats"))
                {
                    return BadRequest(new { Message = ex.Message, ConflictSeats = ex.Data["ConflictSeats"] });
                }
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi giữ ghế", Error = ex.Message });
            }
        }

        [HttpGet("{id}/status")]
        public async Task<IActionResult> GetBookingStatus(int id)
        {
            try
            {
                var status = await _bookingService.CheckAndExpireBookingAsync(id);
                return Ok(new { Status = status });
            }
            catch (UserFriendlyException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi khi kiểm tra trạng thái", Error = ex.Message });
            }
        }
    }
}

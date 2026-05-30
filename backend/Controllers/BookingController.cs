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
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly AppDbContext _db;

        public BookingController(IBookingService bookingService, AppDbContext db)
        {
            _bookingService = bookingService;
            _db = db;
        }

        [HttpGet("my-tickets")]
        public async Task<IActionResult> GetMyTickets()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                // Cho mục đích demo, tự động lấy user đầu tiên nếu chưa đăng nhập
                userId = _db.Users.Select(u => u.Id).FirstOrDefault();
                if (string.IsNullOrEmpty(userId)) return Unauthorized(new { Message = "User không hợp lệ." });
            }

            var bookings = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync(
                _db.Bookings
                .Include(b => b.Tickets)
                .Where(b => b.UserId == userId && b.Status == "Completed")
                .OrderByDescending(b => b.BookingTime)
            );

            var result = bookings.Select(b => new
            {
                b.Id,
                b.MovieTitle,
                b.MoviePosterUrl,
                b.MovieDuration,
                b.MovieAgeRating,
                b.MovieGenres,
                b.CinemaName,
                b.CinemaAddress,
                b.RoomName,
                b.ComboNames,
                b.ShowtimeStart,
                b.TotalPrice,
                b.BookingTime,
                Tickets = b.Tickets.Select(t => new
                {
                    t.SeatName,
                    t.SeatType,
                    t.Price,
                    t.TicketCode,
                    t.QrCodeUrl
                })
            });

            return Ok(new { Data = result });
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

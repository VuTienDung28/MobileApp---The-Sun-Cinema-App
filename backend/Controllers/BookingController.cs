using backend.Data;
using backend.Dtos;
using backend.Models;
using backend.Services.Implements;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.Hubs;
using System.Security.Claims;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly PaymentService _paymentService;
        private readonly IHubContext<SeatHub> _hubContext;

        public BookingController(AppDbContext context, PaymentService paymentService, IHubContext<SeatHub> hubContext)
        {
            _context = context;
            _paymentService = paymentService;
            _hubContext = hubContext;
        }

        [HttpPost("hold")]
        public async Task<IActionResult> HoldSeats([FromBody] HoldBookingRequest request)
        {
            // Tạm thời lấy User đầu tiên nếu chưa có Auth
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? await _context.Users.Select(u => u.Id).FirstOrDefaultAsync();

            if (userId == null) return BadRequest(new { Message = "User không tồn tại" });
            if (request.SeatIds == null || !request.SeatIds.Any()) return BadRequest(new { Message = "Chưa chọn ghế" });

            var showtime = await _context.Showtimes.FindAsync(request.ShowtimeId);
            if (showtime == null) return NotFound(new { Message = "Không tìm thấy suất chiếu" });

            // Tính 10 phút trước
            var tenMinsAgo = DateTime.UtcNow.AddMinutes(-10);

            // Kiểm tra ghế xem đã bị bán hoặc đang bị giữ chưa
            var conflictSeats = await _context.Tickets
                .Include(t => t.Booking)
                .Where(t => request.SeatIds.Contains(t.SeatId) 
                            && t.Booking.ShowtimeId == request.ShowtimeId
                            && (t.Booking.Status == "Completed" || 
                               (t.Booking.Status == "Pending" && t.Booking.BookingTime > tenMinsAgo)))
                .Select(t => t.SeatId)
                .ToListAsync();

            if (conflictSeats.Any())
                return BadRequest(new { Message = "Ghế đã bị bán hoặc đang được người khác giữ.", ConflictSeats = conflictSeats });

            // Tính tổng tiền
            decimal totalPrice = showtime.BasePrice * request.SeatIds.Count;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Tạo Booking
                var booking = new Booking
                {
                    UserId = userId,
                    ShowtimeId = request.ShowtimeId,
                    BookingTime = DateTime.UtcNow,
                    TotalPrice = totalPrice,
                    Status = "Pending"
                };

                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync(); // Lấy BookingId

                // Tạo tạm Tickets
                var tickets = request.SeatIds.Select(seatId => new Ticket
                {
                    BookingId = booking.Id,
                    SeatId = seatId,
                    Price = showtime.BasePrice
                }).ToList();

                _context.Tickets.AddRange(tickets);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                // Gọi Gateway tạo QR Code
                var qrUrl = await _paymentService.CreateOrderAndGetQrAsync(booking.Id.ToString(), (long)totalPrice);

                // Gửi event qua SignalR báo cho các user khác đang xem suất chiếu này
                await _hubContext.Clients.Group($"Showtime_{request.ShowtimeId}").SendAsync("SeatLocked");

                return Ok(new
                {
                    BookingId = booking.Id,
                    TotalPrice = totalPrice,
                    QrUrl = qrUrl
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { Message = "Lỗi khi giữ ghế", Error = ex.Message });
            }
        }

        [HttpGet("{id}/status")]
        public async Task<IActionResult> GetBookingStatus(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null) return NotFound();

            // Nếu Pending và quá 10 phút -> Cập nhật thành Expired
            if (booking.Status == "Pending" && booking.BookingTime <= DateTime.UtcNow.AddMinutes(-10))
            {
                booking.Status = "Expired";
                // Có thể dọn dẹp Ticket ở đây hoặc để background job làm
                var tickets = await _context.Tickets.Where(t => t.BookingId == booking.Id).ToListAsync();
                _context.Tickets.RemoveRange(tickets);
                await _context.SaveChangesAsync();
            }

            return Ok(new { Status = booking.Status });
        }
    }
}

using backend.Services.Implements;
using Microsoft.AspNetCore.Mvc;
using backend.Dtos;
using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly PaymentService _paymentService;
        private readonly AppDbContext _context;

        public PaymentController(PaymentService paymentService, AppDbContext context)
        {
            _paymentService = paymentService;
            _context = context;
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request)
        {
            // Lấy tạm 1 User và 1 Showtime để tạo Booking rác (cho luồng demo sơ khai)
            var userId = await _context.Users.Select(u => u.Id).FirstOrDefaultAsync();
            var showtimeId = await _context.Showtimes.Select(s => s.Id).FirstOrDefaultAsync();
            
            if (userId == null || showtimeId == 0) 
                return BadRequest(new { Message = "Cần có ít nhất 1 User và 1 Showtime trong DB để test luồng này." });

            long totalAmount = request.TotalAmount;

            var booking = new backend.Models.Booking
            {
                UserId = userId,
                ShowtimeId = showtimeId,
                BookingTime = DateTime.UtcNow,
                TotalPrice = totalAmount,
                Status = "Pending"
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            var orderId = booking.Id.ToString(); // Dạng chuỗi nhưng là số nguyên

            // BE gọi Gateway để lấy mã QR
            var qrUrl = await _paymentService.CreateOrderAndGetQrAsync(orderId, totalAmount);

            return Ok(new
            {
                Message = "Khởi tạo thành công",
                Data = new { orderId, amount = totalAmount, qrUrl } // Trả về QR cho Mobile
            });
        }

        [HttpPost("callback")]
        public async Task<IActionResult> PaymentCallback([FromBody] PaymentCallbackRequest request)
        {
            try
            {
                // 1. Giả lập dữ liệu thô để kiểm tra (phải khớp với cách Library băm)
                string rawData = $"bookingId={request.BookingId}&amount={request.Amount}";

                // 2. Sử dụng PaymentService để verify chữ ký nhận được
                bool isValid = _paymentService.ValidateCallback(rawData, request.Signature);
                Console.WriteLine($"[VERIFY] RawData: {rawData}");

                if (!isValid)
                {
                    Console.WriteLine($"[BE] ❌ Cảnh báo: Chữ ký không hợp lệ cho đơn {request.BookingId}!");
                    return BadRequest(new { Message = "Chữ ký không hợp lệ. Giao dịch bị nghi ngờ giả mạo!" });
                }

                // 3. Chỉ khi chữ ký đúng, mới xử lý nghiệp vụ
                Console.WriteLine($"[BE] ✅ Xác thực thành công đơn {request.BookingId}");
                
                // Cập nhật trạng thái Booking
                if (int.TryParse(request.BookingId, out int bookingId))
                {
                    var booking = await _context.Bookings.FindAsync(bookingId);
                    if (booking != null)
                    {
                        if (booking.Status == "Pending")
                        {
                            if (booking.BookingTime > DateTime.UtcNow.AddMinutes(-10))
                            {
                                booking.Status = "Completed";

                                var payment = new backend.Models.Payment
                                {
                                    BookingId = bookingId,
                                    Amount = request.Amount,
                                    PaymentDate = DateTime.UtcNow,
                                    Status = "Success"
                                };
                                _context.Payments.Add(payment);

                                var ticketsToUpdate = await _context.Tickets.Where(t => t.BookingId == bookingId).ToListAsync();
                                foreach (var t in ticketsToUpdate)
                                {
                                    t.QrCodeUrl = $"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data={t.TicketCode}";
                                }

                                await _context.SaveChangesAsync();
                                Console.WriteLine($"[BE] Đã cập nhật Booking {bookingId} thành Completed, tạo Payment và QR code.");
                            }
                            else
                            {
                                booking.Status = "Expired";
                                // Xóa tickets tạm
                                var tickets = await _context.Tickets.Where(t => t.BookingId == bookingId).ToListAsync();
                                _context.Tickets.RemoveRange(tickets);
                                await _context.SaveChangesAsync();
                                Console.WriteLine($"[BE] Booking {bookingId} đã hết hạn. Đã xóa vé tạm.");
                            }
                        }
                    }
                }

                return Ok(new { Message = "Xác nhận thanh toán thành công qua HMAC" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi hệ thống khi xử lý callback.", Error = ex.Message });
            }
        }
    }
}
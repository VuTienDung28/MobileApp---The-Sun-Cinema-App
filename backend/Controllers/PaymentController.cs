using backend.Services.Implements;
using Microsoft.AspNetCore.Mvc;
using backend.Dtos;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly PaymentService _paymentService;

        public PaymentController(PaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request)
        {
            // Nhận đơn hàng từ Mobile, tạo orderId 
            var orderId = $"ORD_{DateTime.Now.Ticks}";
            long totalAmount = request.Quantity * 100000;

            // BE gọi Gateway để lấy mã QR
            var qrUrl = await _paymentService.CreateOrderAndGetQrAsync(orderId, totalAmount);

            return Ok(new
            {
                Message = "Khởi tạo thành công",
                Data = new { orderId, amount = totalAmount, qrUrl } // Trả về QR cho Mobile
            });
        }

        [HttpPost("callback")]
        public IActionResult PaymentCallback([FromBody] PaymentCallbackRequest request)
        {
            try
            {
                // 1. Giả lập dữ liệu thô để kiểm tra (phải khớp với cách Library băm)
                string rawData = $"orderId={request.OrderId}&amount={request.Amount}";

                // 2. Sử dụng PaymentService để verify chữ ký nhận được
                bool isValid = _paymentService.ValidateCallback(rawData, request.Signature);
                Console.WriteLine($"[VERIFY] RawData: {rawData}");

                if (!isValid)
                {
                    Console.WriteLine($"[BE] ❌ Cảnh báo: Chữ ký không hợp lệ cho đơn {request.OrderId}!");
                    return BadRequest(new { Message = "Chữ ký không hợp lệ. Giao dịch bị nghi ngờ giả mạo!" });
                }

                // 3. Chỉ khi chữ ký đúng, mới xử lý nghiệp vụ
                Console.WriteLine($"[BE] ✅ Xác thực thành công đơn {request.OrderId}");
                return Ok(new { Message = "Xác nhận thanh toán thành công qua HMAC" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Lỗi hệ thống khi xử lý callback.", Error = ex.Message });
            }
        }
    }
}
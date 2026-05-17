using Microsoft.AspNetCore.Mvc;
using PaymentGateway.Utils;
using PaymentGateway.Models;

namespace PaymentGatewayService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MockGatewayController : ControllerBase
    {
        private readonly string _secretKey;
        private readonly string _callbackUrl;
        private readonly IHttpClientFactory _httpClientFactory;

        public MockGatewayController(IConfiguration config, IHttpClientFactory httpClientFactory)
        {
            _secretKey = config["PaymentConfig:SecretKey"];
            _callbackUrl = config["PaymentConfig:CallbackUrl"] ?? "http://localhost:5036/api/Payment/callback";
            _httpClientFactory = httpClientFactory;
        }

        // B??c 4-5-6: Nh?n yêu c?u t?o bill t? Business BE
        [HttpPost("create-bill")]
        public IActionResult CreateBill([FromBody] PaymentRequest request)
        {
            // Ki?m tra ch? ký t? BE g?i sang ?? ??m b?o ?úng là BE c?a mình g?i
            string rawData = $"orderId={request.OrderId}&amount={request.Amount}";
            bool isValid = PaymentSecurity.VerifySignature(rawData, request.Signature, _secretKey);

            if (!isValid) return BadRequest("Signature invalid from Business BE");

            // Gi? l?p t?o URL QR 
            var qrUrl = $"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=GATEWAY_BILL_{request.OrderId}";

            return Ok(new
            {
                BillId = $"BILL_{Guid.NewGuid().ToString().Substring(0, 8)}",
                QrUrl = qrUrl
            });
        }

        // B??c 9-10: Gi? l?p ng??i dùng quét mã thành công
        [HttpPost("user-pay")]
        public async Task<IActionResult> UserPay([FromBody] dynamic data)
        {
            string orderId = data.GetProperty("orderId").GetString();
            long amount = data.GetProperty("amount").GetInt64();

            // Gateway t? tính HMAC ?? báo cho BE
            string rawData = $"orderId={orderId}&amount={amount}";
            string signature = PaymentSecurity.GenerateHmacSha256(rawData, _secretKey);

            //  Callback ve Business BE
            var client = _httpClientFactory.CreateClient();
            var callbackData = new { orderId, amount, signature };

            // Chú ý: URL này phải trùng với URL mà BE đã đăng ký để nhận callback 
            var response = await client.PostAsJsonAsync(_callbackUrl, callbackData);

            if (response.IsSuccessStatusCode)
                return Ok(new { Message = "Gateway da xác nhan thành công" });

            return StatusCode(500, "Error callback to BE");
        }
    }
}
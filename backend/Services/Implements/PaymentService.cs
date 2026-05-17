using backend.Services;
using backend.Dtos;
using backend.Utils;
using System.Net.Http.Json;

namespace backend.Services.Implements
{
    public class PaymentService
    {
        private readonly string _secretKey;
        private readonly string _partnerCode;
        private readonly string _gatewayUrl;
        private readonly HttpClient _httpClient;

        public PaymentService(IConfiguration config, HttpClient httpClient)
        {
            _secretKey = config["PaymentConfig:SecretKey"] ?? "";
            _partnerCode = config["PaymentConfig:PartnerCode"] ?? "";
            _gatewayUrl = config["PaymentConfig:GatewayUrl"] ?? "http://localhost:5001/api/MockGateway";
            _httpClient = httpClient;
        }

        public async Task<string> CreateOrderAndGetQrAsync(string orderId, long amount)
        {
            // 1. Tạo request có chữ ký (để gửi cho Gateway)
            string rawData = $"orderId={orderId}&amount={amount}";
            string signature = backend.Utils.PaymentSecurity.GenerateHmacSha256(rawData, _secretKey);
            
            var paymentRequest = new PaymentRequest
            {
                OrderId = orderId,
                Amount = amount,
                OrderInfo = "Thanh toan don hang " + orderId,
                Signature = signature
                // Bổ sung thêm trường PartnerCode vào Dto nếu cần, hiện tại giữ nguyên Dto
            };

            // 2. Gọi sang Mock Gateway để lấy QR URL
            var response = await _httpClient.PostAsJsonAsync($"{_gatewayUrl}/create-bill", paymentRequest);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<dynamic>();
                return result.GetProperty("qrUrl").GetString();
            }

            var errorDetail = await response.Content.ReadAsStringAsync();
            throw new Exception($"Gateway báo lỗi: {response.StatusCode} - Chi tiết: {errorDetail}");
        }

        public bool ValidateCallback(string rawData, string signature)
        {
            return backend.Utils.PaymentSecurity.VerifySignature(rawData, signature, _secretKey);
        }
    }
}
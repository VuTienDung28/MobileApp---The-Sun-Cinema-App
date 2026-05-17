using PaymentGateway.Models;
using PaymentGateway.Utils;

namespace PaymentGateway.Services
{
    public class PaymentProcessor
    {
        public PaymentRequest CreatePaymentRequest(string orderId, long amount, string secretKey)
        {
            string rawData = $"orderId={orderId}&amount={amount}";
            string signature = PaymentSecurity.GenerateHmacSha256(rawData, secretKey);

            return new PaymentRequest
            {
                OrderId = orderId,
                Amount = amount,
                OrderInfo = $"Thanh toán đơn hàng {orderId}",
                Signature = signature
            };
        }
    }
}

using PaymentGateway.Models;
using PaymentGateway.Utils;

namespace PaymentGateway.Services
{
    public class PaymentProcessor
    {
        public PaymentRequest CreatePaymentRequest(string bookingId, long amount, string secretKey)
        {
            string rawData = $"bookingId={bookingId}&amount={amount}";
            string signature = PaymentSecurity.GenerateHmacSha256(rawData, secretKey);

            return new PaymentRequest
            {
                BookingId = bookingId,
                Amount = amount,
                OrderInfo = $"Thanh toán đơn hàng {bookingId}",
                Signature = signature
            };
        }
    }
}

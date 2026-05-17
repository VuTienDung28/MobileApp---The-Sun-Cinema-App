namespace PaymentGateway.Models   // ← namespace của MockGateway
{
    public class PaymentRequest
    {
        public string OrderId { get; set; } = string.Empty;
        public long Amount { get; set; }
        public string OrderInfo { get; set; } = string.Empty;
        public string Signature { get; set; } = string.Empty;
    }

    public class PaymentResponse
    {
        public string OrderId { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
        public string ResponseCode { get; set; } = string.Empty;
        public string Signature { get; set; } = string.Empty;
        public long Amount { get; set; }
    }
}

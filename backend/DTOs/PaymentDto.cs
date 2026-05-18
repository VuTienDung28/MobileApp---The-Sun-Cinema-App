namespace backend.Dtos
{
    public class CheckoutRequest
    {
        public long TotalAmount { get; set; }
    }

    public class PaymentCallbackRequest

    {
        public long Amount { get; set; }
        public string BookingId { get; set; } = string.Empty;
        public string Signature { get; set; } = string.Empty;
        
    }
    public class PaymentRequest
    {
        public string BookingId { get; set; } = string.Empty;
        public long Amount { get; set; }
        public string OrderInfo { get; set; } = string.Empty;
        public string Signature { get; set; } = string.Empty;
    }
    
}


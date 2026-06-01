namespace backend.Models
{
    /// <summary>Cấu hình Resend.com để gửi email (đọc từ appsettings.json)</summary>
    public class ResendOptions
    {
        /// <summary>API Key lấy từ resend.com/api-keys</summary>
        public string ApiKey { get; set; } = string.Empty;

        /// <summary>Địa chỉ email người gửi (phải là domain đã verify trên Resend)</summary>
        public string FromAddress { get; set; } = string.Empty;

        /// <summary>Tên hiển thị trong phần "From"</summary>
        public string FromName { get; set; } = "The Sun Cinema";
    }
}

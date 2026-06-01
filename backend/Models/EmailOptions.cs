namespace backend.Models
{
    /// <summary>Cấu hình SMTP để gửi email (đọc từ appsettings.json)</summary>
    public class EmailOptions
    {
        public string Host { get; set; } = string.Empty;
        public int Port { get; set; } = 587;
        public bool UseSsl { get; set; } = false;
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        /// <summary>Tên hiển thị trong phần "From"</summary>
        public string FromName { get; set; } = "The Sun Cinema";
        /// <summary>Địa chỉ email người gửi</summary>
        public string FromAddress { get; set; } = string.Empty;
    }
}

namespace backend.Services.Interface
{
    public interface IEmailService
    {
        /// <summary>
        /// Gửi email bất đồng bộ.
        /// </summary>
        /// <param name="toEmail">Địa chỉ email nhận</param>
        /// <param name="toName">Tên người nhận</param>
        /// <param name="subject">Tiêu đề email</param>
        /// <param name="htmlBody">Nội dung HTML</param>
        Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody);
    }
}

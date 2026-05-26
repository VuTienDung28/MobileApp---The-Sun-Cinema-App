using backend.Models;
using backend.Services.Interface;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace backend.Services.Implements
{
    public class EmailService : IEmailService
    {
        private readonly EmailOptions _emailOptions;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailOptions> emailOptions, ILogger<EmailService> logger)
        {
            _emailOptions = emailOptions.Value;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string toName, string subject, string htmlBody)
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_emailOptions.FromName, _emailOptions.FromAddress));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;

            message.Body = new TextPart(MimeKit.Text.TextFormat.Html)
            {
                Text = htmlBody
            };

            using var client = new SmtpClient();
            try
            {
                var secureOption = _emailOptions.UseSsl
                    ? SecureSocketOptions.SslOnConnect
                    : SecureSocketOptions.StartTlsWhenAvailable;

                await client.ConnectAsync(_emailOptions.Host, _emailOptions.Port, secureOption);
                await client.AuthenticateAsync(_emailOptions.UserName, _emailOptions.Password);
                await client.SendAsync(message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gửi email đến {Email}", toEmail);
                throw;
            }
            finally
            {
                await client.DisconnectAsync(true);
            }
        }
    }
}

using System.Security.Cryptography;
using System.Text;

namespace PaymentGateway.Utils   
{
    public static class PaymentSecurity
    {
        public static string GenerateHmacSha256(string rawData, string secretKey)
        {
            var keyBytes = Encoding.UTF8.GetBytes(secretKey);
            var dataBytes = Encoding.UTF8.GetBytes(rawData);
            using var hmac = new HMACSHA256(keyBytes);
            var hashBytes = hmac.ComputeHash(dataBytes);
            return BitConverter.ToString(hashBytes).Replace("-", "").ToLower();
        }

        public static bool VerifySignature(string rawData, string signature, string secretKey)
        {
            string computed = GenerateHmacSha256(rawData, secretKey);
            return computed.Equals(signature, StringComparison.OrdinalIgnoreCase);
        }
    }
}

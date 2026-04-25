using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using backend.Exceptions;
using backend.Models;
using backend.Services.Interface;
using Microsoft.Extensions.Options;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Processing;

namespace backend.Services.Implements
{
    public class MinIOStorageService : IStorageService
    {
        private readonly MinIOOptions _minioOptions;
        private readonly AmazonS3Client _s3Client;

        // Cấu hình giới hạn upload
        private const long   MaxFileSizeBytes = 5 * 1024 * 1024; // 5MB
        private const int    AvatarSizePx     = 400;              // resize về 400x400
        private const int    JpegQuality      = 85;               // chất lượng nén JPEG

        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".webp"
        };

        public MinIOStorageService(IOptions<MinIOOptions> minioOptions)
        {
            _minioOptions = minioOptions.Value;

            // Cấu hình AmazonS3Client trỏ vào MinIO
            // ForcePathStyle = true là BẮT BUỘC khi dùng MinIO
            var config = new AmazonS3Config
            {
                ServiceURL     = $"{(_minioOptions.UseSSL ? "https" : "http")}://{_minioOptions.Endpoint}",
                ForcePathStyle = true
            };

            var credentials = new BasicAWSCredentials(_minioOptions.AccessKey, _minioOptions.SecretKey);
            _s3Client = new AmazonS3Client(credentials, config);
        }

        // =============================================
        // Upload file → relative path
        // =============================================
        public async Task<string> UploadAsync(IFormFile file, string bucketName, string objectKey)
        {
            // 1. Validate kích thước
            if (file.Length > MaxFileSizeBytes)
                throw new UserFriendlyException("Kích thước ảnh không được vượt quá 5MB.", "FILE_TOO_LARGE");

            // 2. Validate extension
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(ext))
                throw new UserFriendlyException("Chỉ chấp nhận ảnh định dạng JPG, PNG hoặc WEBP.", "INVALID_FILE_TYPE");

            // 3. Validate thực sự là ảnh (chống giả mạo extension) + Resize 400x400
            using var outputStream = new MemoryStream();

            try
            {
                using var image = await Image.LoadAsync(file.OpenReadStream());

                // Resize về 400x400, giữ nguyên tỉ lệ & crop giữa
                image.Mutate(x => x.Resize(new ResizeOptions
                {
                    Size = new Size(AvatarSizePx, AvatarSizePx),
                    Mode = ResizeMode.Crop
                }));

                // Luôn lưu ra JPEG để đồng nhất format & tối ưu dung lượng
                await image.SaveAsync(outputStream, new JpegEncoder { Quality = JpegQuality });
                outputStream.Position = 0;
            }
            catch (UnknownImageFormatException)
            {
                throw new UserFriendlyException("File không phải ảnh hợp lệ.", "INVALID_IMAGE");
            }

            // 4. Upload lên MinIO
            var request = new PutObjectRequest
            {
                BucketName  = bucketName,
                Key         = objectKey,
                InputStream = outputStream,
                ContentType = "image/jpeg",
                // Không set CannedACL ở đây — public access đã được set ở bucket level bằng mc
            };

            await _s3Client.PutObjectAsync(request);

            // 5. Trả về relative path (KHÔNG chứa host/domain)
            return $"/{bucketName}/{objectKey}";
        }

        // =============================================
        // Xoá file theo relative path
        // =============================================
        public async Task DeleteAsync(string relativePath)
        {
            // relativePath = "/avatar-images/user123_1714000000.jpg"
            // Tách ra: bucketName = "avatar-images", key = "user123_1714000000.jpg"
            var parts = relativePath.TrimStart('/').Split('/', 2);
            if (parts.Length != 2) return;

            var bucketName = parts[0];
            var objectKey  = parts[1];

            try
            {
                var request = new DeleteObjectRequest
                {
                    BucketName = bucketName,
                    Key        = objectKey
                };
                await _s3Client.DeleteObjectAsync(request);
            }
            catch
            {
                // Không throw nếu file cũ không tồn tại — chỉ log warning
            }
        }
    }
}

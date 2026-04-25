using Microsoft.AspNetCore.Http;

namespace backend.Services.Interface
{
    public interface IStorageService
    {
        /// <summary>
        /// Upload file lên storage. Trả về đường dẫn tương đối (relative path).
        /// VD: /avatar-images/user123_1714000000.jpg
        /// </summary>
        Task<string> UploadAsync(IFormFile file, string bucketName, string objectKey);

        /// <summary>
        /// Xoá file theo đường dẫn tương đối.
        /// </summary>
        Task DeleteAsync(string relativePath);
    }
}

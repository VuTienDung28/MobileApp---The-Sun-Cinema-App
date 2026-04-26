namespace backend.Models
{
    /// <summary>
    /// Strongly-typed config class bind từ appsettings.json section "MinIO"
    /// </summary>
    public class MinIOOptions
    {
        public string Endpoint          { get; set; } = string.Empty;
        public string AccessKey         { get; set; } = string.Empty;
        public string SecretKey         { get; set; } = string.Empty;
        public string AvatarBucketName  { get; set; } = string.Empty;
        public string MovieBucketName   { get; set; } = string.Empty;
        public bool   UseSSL            { get; set; } = false;
    }
}

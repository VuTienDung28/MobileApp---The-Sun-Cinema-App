using System.Text.Json.Serialization;

namespace backend.Models
{
    /// <summary>
    /// Standardized API Response wrapper
    /// </summary>
    public class ApiResponse<T>
    {
        [JsonPropertyName("isSuccess")]
        public bool IsSuccess { get; set; }

        [JsonPropertyName("code")]
        public string Code { get; set; }

        [JsonPropertyName("message")]
        public string Message { get; set; }

        [JsonPropertyName("data")]
        public T Data { get; set; }

        // Constructor cho success response
        public static ApiResponse<T> Success(T data, string message = "Success", string code = "SUCCESS")
        {
            return new ApiResponse<T>
            {
                IsSuccess = true,
                Code = code,
                Message = message,
                Data = data
            };
        }

        // Constructor cho failure response
        public static ApiResponse<T> Failure(string code = "ERROR", string message = "An error occurred", T? data = default)
        {
            return new ApiResponse<T>
            {
                IsSuccess = false,
                Code = code,
                Message = message,
                Data = data
            };
        }
    }

    /// <summary>
    /// ApiResponse cho validation errors
    /// </summary>
    public class ApiValidationErrorResponse
    {
        [JsonPropertyName("isSuccess")]
        public bool IsSuccess { get; set; } = false;

        [JsonPropertyName("code")]
        public string Code { get; set; } = "VALIDATION_ERROR";

        [JsonPropertyName("message")]
        public string Message { get; set; } = "Validation failed";

        [JsonPropertyName("data")]
        public Dictionary<string, string[]> Data { get; set; } // Field -> List of errors
    }
}
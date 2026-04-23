namespace backend.Exceptions
{
    public class UserFriendlyException : Exception
    {
        public string ErrorCode { get; set; }

        public UserFriendlyException(string message, string errorCode = "USER_ERROR") : base(message)
        {
            ErrorCode = errorCode;
        }
    }
}

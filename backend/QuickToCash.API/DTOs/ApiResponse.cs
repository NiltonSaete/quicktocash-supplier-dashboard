namespace QuickToCash.API.DTOs
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<string> Errors { get; set; } = new();

        public static ApiResponse<T> Ok(T data, string message = "") =>
            new() { Success = true, Data = data, Message = message };

        public static ApiResponse<T> Fail(string error) =>
            new() { Success = false, Errors = new List<string> { error } };
    }
}
namespace CLINICSYSTEM.Data.DTOs
{
    public static class ApiResponse
    {
        public static object Ok(object? data, string message = "")
        {
            return new
            {
                success = true,
                message,
                data = data ?? new { }
            };
        }

        public static object Fail(string message, object? data = null)
        {
            return new
            {
                success = false,
                message,
                data = data ?? new { }
            };
        }
    }
}

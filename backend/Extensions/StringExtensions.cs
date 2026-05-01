using System.Text;
using System.Text.RegularExpressions;

namespace CLINICSYSTEM.Extensions;

/// <summary>
/// Extension methods for string manipulation
/// </summary>
public static class StringExtensions
{
    /// <summary>
    /// Check if string is null or empty
    /// </summary>
    public static bool IsNullOrEmpty(this string? value)
    {
        return string.IsNullOrEmpty(value);
    }

    /// <summary>
    /// Check if string is null or whitespace
    /// </summary>
    public static bool IsNullOrWhiteSpace(this string? value)
    {
        return string.IsNullOrWhiteSpace(value);
    }

    /// <summary>
    /// Truncate string to specified length
    /// </summary>
    public static string Truncate(this string value, int maxLength, string suffix = "...")
    {
        if (string.IsNullOrEmpty(value) || value.Length <= maxLength)
            return value;

        return value.Substring(0, maxLength - suffix.Length) + suffix;
    }

    /// <summary>
    /// Convert string to title case
    /// </summary>
    public static string ToTitleCase(this string value)
    {
        if (string.IsNullOrEmpty(value))
            return value;

        var textInfo = System.Globalization.CultureInfo.CurrentCulture.TextInfo;
        return textInfo.ToTitleCase(value.ToLower());
    }

    /// <summary>
    /// Remove all whitespace from string
    /// </summary>
    public static string RemoveWhitespace(this string value)
    {
        if (string.IsNullOrEmpty(value))
            return value;

        return Regex.Replace(value, @"\s+", "");
    }

    /// <summary>
    /// Convert string to camelCase
    /// </summary>
    public static string ToCamelCase(this string value)
    {
        if (string.IsNullOrEmpty(value))
            return value;

        return char.ToLowerInvariant(value[0]) + value.Substring(1);
    }

    /// <summary>
    /// Convert string to PascalCase
    /// </summary>
    public static string ToPascalCase(this string value)
    {
        if (string.IsNullOrEmpty(value))
            return value;

        return char.ToUpperInvariant(value[0]) + value.Substring(1);
    }

    /// <summary>
    /// Convert string to kebab-case
    /// </summary>
    public static string ToKebabCase(this string value)
    {
        if (string.IsNullOrEmpty(value))
            return value;

        return Regex.Replace(value, "([a-z])([A-Z])", "$1-$2").ToLower();
    }

    /// <summary>
    /// Convert string to snake_case
    /// </summary>
    public static string ToSnakeCase(this string value)
    {
        if (string.IsNullOrEmpty(value))
            return value;

        return Regex.Replace(value, "([a-z])([A-Z])", "$1_$2").ToLower();
    }

    /// <summary>
    /// Check if string contains only digits
    /// </summary>
    public static bool IsNumeric(this string value)
    {
        return !string.IsNullOrEmpty(value) && value.All(char.IsDigit);
    }

    /// <summary>
    /// Check if string is a valid email
    /// </summary>
    public static bool IsValidEmail(this string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return false;

        try
        {
            var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
            return emailRegex.IsMatch(value);
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Mask email address (show first 3 chars and domain)
    /// </summary>
    public static string MaskEmail(this string email)
    {
        if (string.IsNullOrWhiteSpace(email) || !email.Contains("@"))
            return email;

        var parts = email.Split('@');
        var username = parts[0];
        var domain = parts[1];

        if (username.Length <= 3)
            return $"***@{domain}";

        return $"{username.Substring(0, 3)}***@{domain}";
    }

    /// <summary>
    /// Remove special characters
    /// </summary>
    public static string RemoveSpecialCharacters(this string value)
    {
        if (string.IsNullOrEmpty(value))
            return value;

        return Regex.Replace(value, "[^a-zA-Z0-9_.]", "");
    }

    /// <summary>
    /// Convert to Base64
    /// </summary>
    public static string ToBase64(this string value)
    {
        if (string.IsNullOrEmpty(value))
            return value;

        var bytes = Encoding.UTF8.GetBytes(value);
        return Convert.ToBase64String(bytes);
    }

    /// <summary>
    /// Convert from Base64
    /// </summary>
    public static string FromBase64(this string value)
    {
        if (string.IsNullOrEmpty(value))
            return value;

        var bytes = Convert.FromBase64String(value);
        return Encoding.UTF8.GetString(bytes);
    }

    /// <summary>
    /// Get initials from name
    /// </summary>
    public static string GetInitials(this string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return string.Empty;

        var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        var initials = new StringBuilder();

        foreach (var part in parts.Take(2))
        {
            initials.Append(char.ToUpper(part[0]));
        }

        return initials.ToString();
    }

    /// <summary>
    /// Count words in string
    /// </summary>
    public static int WordCount(this string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return 0;

        return value.Split(new[] { ' ', '\t', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries).Length;
    }

    /// <summary>
    /// Reverse string
    /// </summary>
    public static string Reverse(this string value)
    {
        if (string.IsNullOrEmpty(value))
            return value;

        return new string(value.Reverse().ToArray());
    }

    /// <summary>
    /// Repeat string N times
    /// </summary>
    public static string Repeat(this string value, int count)
    {
        if (string.IsNullOrEmpty(value) || count <= 0)
            return string.Empty;

        return string.Concat(Enumerable.Repeat(value, count));
    }
}

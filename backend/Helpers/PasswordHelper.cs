using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace CLINICSYSTEM.Helpers;

/// <summary>
/// Helper class for password operations
/// </summary>
public static class PasswordHelper
{
    /// <summary>
    /// Check password strength
    /// </summary>
    public static (bool IsStrong, string Message) CheckPasswordStrength(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            return (false, "Password is required.");

        if (password.Length < 8)
            return (false, "Password must be at least 8 characters long.");

        if (password.Length > 100)
            return (false, "Password must not exceed 100 characters.");

        if (!Regex.IsMatch(password, "[A-Z]"))
            return (false, "Password must contain at least one uppercase letter.");

        if (!Regex.IsMatch(password, "[a-z]"))
            return (false, "Password must contain at least one lowercase letter.");

        if (!Regex.IsMatch(password, "[0-9]"))
            return (false, "Password must contain at least one digit.");

        if (!Regex.IsMatch(password, "[^a-zA-Z0-9]"))
            return (false, "Password must contain at least one special character.");

        return (true, "Password is strong.");
    }

    /// <summary>
    /// Generate random password
    /// </summary>
    public static string GenerateRandomPassword(int length = 12)
    {
        const string validChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*";
        var random = new Random();
        var password = new StringBuilder();

        // Ensure at least one of each required character type
        password.Append((char)random.Next('A', 'Z' + 1)); // Uppercase
        password.Append((char)random.Next('a', 'z' + 1)); // Lowercase
        password.Append((char)random.Next('0', '9' + 1)); // Digit
        password.Append("!@#$%^&*"[random.Next(0, 8)]); // Special char

        // Fill the rest randomly
        for (int i = 4; i < length; i++)
        {
            password.Append(validChars[random.Next(validChars.Length)]);
        }

        // Shuffle the password
        return new string(password.ToString().OrderBy(x => random.Next()).ToArray());
    }

    /// <summary>
    /// Hash password using SHA256 (for additional security layer, use ASP.NET Identity's hasher in production)
    /// </summary>
    public static string HashPassword(string password)
    {
        using (var sha256 = SHA256.Create())
        {
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }
    }

    /// <summary>
    /// Verify hashed password
    /// </summary>
    public static bool VerifyPassword(string password, string hashedPassword)
    {
        var hashOfInput = HashPassword(password);
        return hashOfInput.Equals(hashedPassword);
    }

    /// <summary>
    /// Calculate password entropy (strength score)
    /// </summary>
    public static double CalculatePasswordEntropy(string password)
    {
        if (string.IsNullOrEmpty(password))
            return 0;

        int poolSize = 0;
        
        if (Regex.IsMatch(password, "[a-z]")) poolSize += 26;
        if (Regex.IsMatch(password, "[A-Z]")) poolSize += 26;
        if (Regex.IsMatch(password, "[0-9]")) poolSize += 10;
        if (Regex.IsMatch(password, "[^a-zA-Z0-9]")) poolSize += 32;

        return password.Length * Math.Log2(poolSize);
    }

    /// <summary>
    /// Get password strength level
    /// </summary>
    public static string GetPasswordStrengthLevel(string password)
    {
        var entropy = CalculatePasswordEntropy(password);

        return entropy switch
        {
            < 28 => "Very Weak",
            < 36 => "Weak",
            < 60 => "Moderate",
            < 128 => "Strong",
            _ => "Very Strong"
        };
    }

    /// <summary>
    /// Check if password contains common patterns
    /// </summary>
    public static bool ContainsCommonPatterns(string password)
    {
        var commonPatterns = new[]
        {
            "123456", "password", "12345678", "qwerty", "abc123",
            "monkey", "111111", "letmein", "dragon", "baseball"
        };

        return commonPatterns.Any(pattern => 
            password.ToLower().Contains(pattern));
    }

    /// <summary>
    /// Suggest password improvements
    /// </summary>
    public static List<string> GetPasswordSuggestions(string password)
    {
        var suggestions = new List<string>();

        if (password.Length < 12)
            suggestions.Add("Consider using at least 12 characters for better security.");

        if (!Regex.IsMatch(password, "[A-Z]"))
            suggestions.Add("Add uppercase letters (A-Z).");

        if (!Regex.IsMatch(password, "[a-z]"))
            suggestions.Add("Add lowercase letters (a-z).");

        if (!Regex.IsMatch(password, "[0-9]"))
            suggestions.Add("Add numbers (0-9).");

        if (!Regex.IsMatch(password, "[^a-zA-Z0-9]"))
            suggestions.Add("Add special characters (!@#$%^&*).");

        if (ContainsCommonPatterns(password))
            suggestions.Add("Avoid common words and patterns.");

        if (Regex.IsMatch(password, @"(.)\1{2,}"))
            suggestions.Add("Avoid repeating characters.");

        return suggestions;
    }
}

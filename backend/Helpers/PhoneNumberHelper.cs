using System.Text.RegularExpressions;

namespace CLINICSYSTEM.Helpers;

/// <summary>
/// Helper class for phone number operations
/// </summary>
public static class PhoneNumberHelper
{
    // Egyptian phone number patterns
    private static readonly Regex EgyptMobilePattern = new(@"^(\+20|0)?1[0125]\d{8}$");
    private static readonly Regex InternationalPattern = new(@"^\+?[1-9]\d{1,14}$");

    /// <summary>
    /// Validate Egyptian mobile number
    /// </summary>
    public static bool IsValidEgyptMobileNumber(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return false;

        var cleanNumber = CleanPhoneNumber(phoneNumber);
        return EgyptMobilePattern.IsMatch(cleanNumber);
    }

    /// <summary>
    /// Validate international phone number (E.164 format)
    /// </summary>
    public static bool IsValidInternationalNumber(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return false;

        var cleanNumber = CleanPhoneNumber(phoneNumber);
        return InternationalPattern.IsMatch(cleanNumber);
    }

    /// <summary>
    /// Clean phone number (remove spaces, dashes, parentheses)
    /// </summary>
    public static string CleanPhoneNumber(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return string.Empty;

        return Regex.Replace(phoneNumber, @"[\s\-\(\)]", "");
    }

    /// <summary>
    /// Format Egyptian mobile number to standard format (+20XXXXXXXXXX)
    /// </summary>
    public static string FormatEgyptMobileNumber(string phoneNumber)
    {
        var cleanNumber = CleanPhoneNumber(phoneNumber);

        if (string.IsNullOrWhiteSpace(cleanNumber))
            return string.Empty;

        // Remove leading +20 or 0 if present
        if (cleanNumber.StartsWith("+20"))
            cleanNumber = cleanNumber.Substring(3);
        else if (cleanNumber.StartsWith("20"))
            cleanNumber = cleanNumber.Substring(2);
        else if (cleanNumber.StartsWith("0"))
            cleanNumber = cleanNumber.Substring(1);

        // Add +20 prefix
        if (cleanNumber.Length == 10 && cleanNumber.StartsWith("1"))
            return $"+20{cleanNumber}";

        return phoneNumber; // Return original if format is invalid
    }

    /// <summary>
    /// Format phone number for display (with spaces)
    /// </summary>
    public static string FormatForDisplay(string phoneNumber)
    {
        var formatted = FormatEgyptMobileNumber(phoneNumber);

        if (formatted.StartsWith("+20") && formatted.Length == 13)
        {
            // Format: +20 1XX XXX XXXX
            return $"{formatted.Substring(0, 3)} {formatted.Substring(3, 3)} {formatted.Substring(6, 3)} {formatted.Substring(9)}";
        }

        return phoneNumber;
    }

    /// <summary>
    /// Get mobile carrier from Egyptian number
    /// </summary>
    public static string GetEgyptMobileCarrier(string phoneNumber)
    {
        var cleanNumber = CleanPhoneNumber(phoneNumber);

        if (!IsValidEgyptMobileNumber(cleanNumber))
            return "Unknown";

        // Extract the digit after the country code
        var carrierDigit = cleanNumber.StartsWith("+20") 
            ? cleanNumber[3] 
            : cleanNumber.StartsWith("0") 
                ? cleanNumber[1] 
                : cleanNumber[0];

        return carrierDigit switch
        {
            '0' => "Vodafone",
            '1' => "Etisalat",
            '2' => "Orange",
            '5' => "WE (Telecom Egypt)",
            _ => "Unknown"
        };
    }

    /// <summary>
    /// Mask phone number for privacy (show only last 4 digits)
    /// </summary>
    public static string MaskPhoneNumber(string phoneNumber)
    {
        var cleanNumber = CleanPhoneNumber(phoneNumber);

        if (cleanNumber.Length < 4)
            return "****";

        var lastFour = cleanNumber.Substring(cleanNumber.Length - 4);
        var masked = new string('*', cleanNumber.Length - 4);

        return $"{masked}{lastFour}";
    }

    /// <summary>
    /// Parse phone number components
    /// </summary>
    public static (string CountryCode, string Number) ParsePhoneNumber(string phoneNumber)
    {
        var cleanNumber = CleanPhoneNumber(phoneNumber);

        if (cleanNumber.StartsWith("+20"))
            return ("+20", cleanNumber.Substring(3));

        if (cleanNumber.StartsWith("20"))
            return ("+20", cleanNumber.Substring(2));

        if (cleanNumber.StartsWith("0"))
            return ("+20", cleanNumber.Substring(1));

        return (string.Empty, cleanNumber);
    }

    /// <summary>
    /// Validate and format phone number
    /// </summary>
    public static (bool IsValid, string FormattedNumber, string ErrorMessage) ValidateAndFormat(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return (false, string.Empty, "Phone number is required.");

        var cleanNumber = CleanPhoneNumber(phoneNumber);

        if (!IsValidEgyptMobileNumber(cleanNumber))
            return (false, phoneNumber, "Invalid Egyptian mobile number format. Use format: +20XXXXXXXXXX or 01XXXXXXXXX");

        var formatted = FormatEgyptMobileNumber(cleanNumber);
        return (true, formatted, string.Empty);
    }

    /// <summary>
    /// Check if two phone numbers are the same
    /// </summary>
    public static bool ArePhoneNumbersEqual(string phoneNumber1, string phoneNumber2)
    {
        var formatted1 = FormatEgyptMobileNumber(phoneNumber1);
        var formatted2 = FormatEgyptMobileNumber(phoneNumber2);

        return formatted1.Equals(formatted2, StringComparison.OrdinalIgnoreCase);
    }
}

using CLINICSYSTEM.Constants;
using System.Globalization;

namespace CLINICSYSTEM.Helpers;

/// <summary>
/// Helper class for date and time operations
/// </summary>
public static class DateTimeHelper
{
    /// <summary>
    /// Get the current date and time in Egypt timezone
    /// </summary>
    public static DateTime GetEgyptDateTime()
    {
        var egyptTimeZone = TimeZoneInfo.FindSystemTimeZoneById(AppConstants.DateTime.EgyptTimeZoneId);
        return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, egyptTimeZone);
    }

    /// <summary>
    /// Get the current date in Egypt timezone
    /// </summary>
    public static DateTime GetEgyptDate()
    {
        return GetEgyptDateTime().Date;
    }

    /// <summary>
    /// Convert UTC datetime to Egypt timezone
    /// </summary>
    public static DateTime ConvertToEgyptTime(DateTime utcDateTime)
    {
        var egyptTimeZone = TimeZoneInfo.FindSystemTimeZoneById(AppConstants.DateTime.EgyptTimeZoneId);
        return TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, egyptTimeZone);
    }

    /// <summary>
    /// Convert Egypt datetime to UTC
    /// </summary>
    public static DateTime ConvertToUtc(DateTime egyptDateTime)
    {
        var egyptTimeZone = TimeZoneInfo.FindSystemTimeZoneById(AppConstants.DateTime.EgyptTimeZoneId);
        return TimeZoneInfo.ConvertTimeToUtc(egyptDateTime, egyptTimeZone);
    }

    /// <summary>
    /// Parse date string with flexible formats
    /// Supports formats: yyyy/MM/dd, dd/MM/yyyy, yyyy-MM-dd, dd-MM-yyyy
    /// </summary>
    public static DateTime? ParseFlexibleDate(string? dateString)
    {
        if (string.IsNullOrWhiteSpace(dateString))
            return null;

        var formats = new[]
        {
            "yyyy/MM/dd", "yyyy/M/d",
            "dd/MM/yyyy", "d/MM/yyyy", "dd/M/yyyy", "d/M/yyyy",
            "yyyy-MM-dd", "yyyy-M-d",
            "dd-MM-yyyy", "d-MM-yyyy", "dd-M-yyyy", "d-M-yyyy",
            "MM/dd/yyyy", "M/dd/yyyy", "MM/d/yyyy", "M/d/yyyy"
        };

        foreach (var format in formats)
        {
            if (DateTime.TryParseExact(dateString, format, CultureInfo.InvariantCulture, DateTimeStyles.None, out var result))
            {
                return result;
            }
        }

        // Fallback to standard parsing
        if (DateTime.TryParse(dateString, out var fallbackResult))
        {
            return fallbackResult;
        }

        return null;
    }

    /// <summary>
    /// Calculate age from date of birth
    /// </summary>
    public static int CalculateAge(DateTime dateOfBirth)
    {
        var today = GetEgyptDate();
        var age = today.Year - dateOfBirth.Year;
        
        if (dateOfBirth.Date > today.AddYears(-age))
            age--;
        
        return age;
    }

    /// <summary>
    /// Check if date is in the past
    /// </summary>
    public static bool IsInPast(DateTime date)
    {
        return date < GetEgyptDateTime();
    }

    /// <summary>
    /// Check if date is in the future
    /// </summary>
    public static bool IsInFuture(DateTime date)
    {
        return date > GetEgyptDateTime();
    }

    /// <summary>
    /// Get start of day (midnight)
    /// </summary>
    public static DateTime GetStartOfDay(DateTime date)
    {
        return date.Date;
    }

    /// <summary>
    /// Get end of day (23:59:59)
    /// </summary>
    public static DateTime GetEndOfDay(DateTime date)
    {
        return date.Date.AddDays(1).AddTicks(-1);
    }

    /// <summary>
    /// Format date to standard format (yyyy-MM-dd)
    /// </summary>
    public static string FormatDate(DateTime date)
    {
        return date.ToString(AppConstants.DateTime.DateFormat);
    }

    /// <summary>
    /// Format time to standard format (HH:mm)
    /// </summary>
    public static string FormatTime(DateTime time)
    {
        return time.ToString(AppConstants.DateTime.TimeFormat);
    }

    /// <summary>
    /// Format datetime to standard format (yyyy-MM-dd HH:mm:ss)
    /// </summary>
    public static string FormatDateTime(DateTime dateTime)
    {
        return dateTime.ToString(AppConstants.DateTime.DateTimeFormat);
    }

    /// <summary>
    /// Check if a datetime is within a time range
    /// </summary>
    public static bool IsWithinTimeRange(DateTime dateTime, TimeSpan startTime, TimeSpan endTime)
    {
        var time = dateTime.TimeOfDay;
        return time >= startTime && time <= endTime;
    }

    /// <summary>
    /// Add business days (excluding weekends)
    /// </summary>
    public static DateTime AddBusinessDays(DateTime startDate, int businessDays)
    {
        var result = startDate;
        var daysAdded = 0;

        while (daysAdded < businessDays)
        {
            result = result.AddDays(1);
            if (result.DayOfWeek != DayOfWeek.Friday && result.DayOfWeek != DayOfWeek.Saturday)
            {
                daysAdded++;
            }
        }

        return result;
    }

    /// <summary>
    /// Get the difference in minutes between two datetimes
    /// </summary>
    public static int GetMinutesDifference(DateTime start, DateTime end)
    {
        return (int)(end - start).TotalMinutes;
    }

    /// <summary>
    /// Check if datetime is today
    /// </summary>
    public static bool IsToday(DateTime date)
    {
        return date.Date == GetEgyptDate();
    }

    /// <summary>
    /// Check if datetime is tomorrow
    /// </summary>
    public static bool IsTomorrow(DateTime date)
    {
        return date.Date == GetEgyptDate().AddDays(1);
    }
}

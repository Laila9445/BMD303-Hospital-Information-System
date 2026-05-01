using CLINICSYSTEM.Helpers;

namespace CLINICSYSTEM.Services;

/// <summary>
/// DateTime provider for getting current date and time (for testability)
/// </summary>
public class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;

    public DateTime Now => DateTime.Now;

    public DateTime Today => DateTimeHelper.GetEgyptDate();

    public DateTime EgyptNow => DateTimeHelper.GetEgyptDateTime();
}

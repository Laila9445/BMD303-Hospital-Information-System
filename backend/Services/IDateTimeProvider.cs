namespace CLINICSYSTEM.Services;

/// <summary>
/// Interface for providing current date and time (for testability)
/// </summary>
public interface IDateTimeProvider
{
    /// <summary>
    /// Get current UTC date and time
    /// </summary>
    DateTime UtcNow { get; }

    /// <summary>
    /// Get current local date and time
    /// </summary>
    DateTime Now { get; }

    /// <summary>
    /// Get current date (Egypt timezone)
    /// </summary>
    DateTime Today { get; }

    /// <summary>
    /// Get Egypt date and time
    /// </summary>
    DateTime EgyptNow { get; }
}

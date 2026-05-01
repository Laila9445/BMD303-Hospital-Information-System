namespace CLINICSYSTEM.Enums;

/// <summary>
/// Represents the type of notification sent to users
/// </summary>
public enum NotificationType
{
    /// <summary>
    /// General information notification
    /// </summary>
    Info = 0,

    /// <summary>
    /// Appointment-related notification (booking, reminder, cancellation)
    /// </summary>
    Appointment = 1,

    /// <summary>
    /// Prescription-related notification (new prescription, ready for pickup)
    /// </summary>
    Prescription = 2,

    /// <summary>
    /// Test results are available
    /// </summary>
    TestResults = 3,

    /// <summary>
    /// System alert or important message
    /// </summary>
    Alert = 4,

    /// <summary>
    /// Reminder notification (appointment reminder, medication reminder)
    /// </summary>
    Reminder = 5,

    /// <summary>
    /// Account-related notification (password change, profile update)
    /// </summary>
    Account = 6
}

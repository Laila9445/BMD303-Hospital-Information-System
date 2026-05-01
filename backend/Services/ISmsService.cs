namespace CLINICSYSTEM.Services;

/// <summary>
/// Interface for SMS service
/// </summary>
public interface ISmsService
{
    /// <summary>
    /// Send SMS
    /// </summary>
    Task<bool> SendSmsAsync(string phoneNumber, string message);

    /// <summary>
    /// Send appointment reminder SMS
    /// </summary>
    Task<bool> SendAppointmentReminderSmsAsync(string phoneNumber, string patientName, DateTime appointmentDate, string timeSlot);

    /// <summary>
    /// Send verification code SMS
    /// </summary>
    Task<bool> SendVerificationCodeAsync(string phoneNumber, string code);

    /// <summary>
    /// Send appointment confirmation SMS
    /// </summary>
    Task<bool> SendAppointmentConfirmationSmsAsync(string phoneNumber, string doctorName, DateTime appointmentDate, string timeSlot);
}

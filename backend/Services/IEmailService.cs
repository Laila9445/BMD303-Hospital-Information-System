namespace CLINICSYSTEM.Services;

/// <summary>
/// Interface for email service
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Send email
    /// </summary>
    Task<bool> SendEmailAsync(string to, string subject, string htmlBody);

    /// <summary>
    /// Send email with attachments
    /// </summary>
    Task<bool> SendEmailWithAttachmentAsync(string to, string subject, string htmlBody, byte[] attachment, string attachmentName);

    /// <summary>
    /// Send welcome email
    /// </summary>
    Task<bool> SendWelcomeEmailAsync(string to, string userName, string userRole);

    /// <summary>
    /// Send appointment confirmation email
    /// </summary>
    Task<bool> SendAppointmentConfirmationEmailAsync(string to, string patientName, string doctorName, DateTime appointmentDate, string timeSlot);

    /// <summary>
    /// Send appointment reminder email
    /// </summary>
    Task<bool> SendAppointmentReminderEmailAsync(string to, string patientName, DateTime appointmentDate, string timeSlot);

    /// <summary>
    /// Send prescription ready email
    /// </summary>
    Task<bool> SendPrescriptionReadyEmailAsync(string to, string patientName, string prescriptionId);

    /// <summary>
    /// Send password reset email
    /// </summary>
    Task<bool> SendPasswordResetEmailAsync(string to, string userName, string resetLink);
}

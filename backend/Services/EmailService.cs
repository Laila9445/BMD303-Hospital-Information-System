using CLINICSYSTEM.Helpers;

namespace CLINICSYSTEM.Services;

/// <summary>
/// Email service stub - disabled for course project
/// </summary>
public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendEmailAsync(string to, string subject, string htmlBody)
    {
        _logger.LogInformation("Email disabled for course project - {To} {Subject}", to, subject);
        return await Task.FromResult(true);
    }

    public async Task<bool> SendEmailWithAttachmentAsync(string to, string subject, string htmlBody, byte[] attachment, string attachmentName)
    {
        _logger.LogInformation("Email disabled for course project - {To} {Subject}", to, subject);
        return await Task.FromResult(true);
    }

    public async Task<bool> SendWelcomeEmailAsync(string to, string userName, string userRole)
    {
        return await SendEmailAsync(to, "Welcome to Dr. Ahmed Nabil Clinic", "");
    }

    public async Task<bool> SendAppointmentConfirmationEmailAsync(string to, string patientName, string doctorName, DateTime appointmentDate, string timeSlot)
    {
        return await SendEmailAsync(to, "Appointment Confirmation - Dr. Ahmed Nabil Clinic", "");
    }

    public async Task<bool> SendAppointmentReminderEmailAsync(string to, string patientName, DateTime appointmentDate, string timeSlot)
    {
        return await SendEmailAsync(to, "Appointment Reminder - Dr. Ahmed Nabil Clinic", "");
    }

    public async Task<bool> SendPrescriptionReadyEmailAsync(string to, string patientName, string prescriptionId)
    {
        return await SendEmailAsync(to, "Your Prescription is Ready - Dr. Ahmed Nabil Clinic", "");
    }

    public async Task<bool> SendPasswordResetEmailAsync(string to, string userName, string resetLink)
    {
        return await SendEmailAsync(to, "Password Reset Request - Dr. Ahmed Nabil Clinic", "");
    }
}

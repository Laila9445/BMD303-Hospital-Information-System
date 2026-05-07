using System.Text;
using CLINICSYSTEM.Helpers;

namespace CLINICSYSTEM.Services;

/// <summary>
/// SMS service stub - disabled for course project
/// All methods log and return true without sending actual SMS
/// </summary>
public class SmsService : ISmsService
{
    private readonly ILogger<SmsService> _logger;

    public SmsService(ILogger<SmsService> logger)
    {
        _logger = logger;
    }

    public async Task<bool> SendSmsAsync(string phoneNumber, string message)
    {
        _logger.LogInformation("SMS disabled for course project - To: {Phone}", phoneNumber);
        return await Task.FromResult(true);
    }

    public async Task<bool> SendAppointmentReminderSmsAsync(string phoneNumber, string patientName, DateTime appointmentDate, string timeSlot)
    {
        _logger.LogInformation("SMS disabled - Appointment reminder for {Patient}", patientName);
        return await Task.FromResult(true);
    }

    public async Task<bool> SendVerificationCodeAsync(string phoneNumber, string code)
    {
        _logger.LogInformation("SMS disabled - Verification code for {Phone}", phoneNumber);
        return await Task.FromResult(true);
    }

    public async Task<bool> SendAppointmentConfirmationSmsAsync(string phoneNumber, string doctorName, DateTime appointmentDate, string timeSlot)
    {
        _logger.LogInformation("SMS disabled - Appointment confirmation with Dr. {Doctor}", doctorName);
        return await Task.FromResult(true);
    }
}

using CLINICSYSTEM.Helpers;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace CLINICSYSTEM.Services;

/// <summary>
/// Email service implementation using MailKit
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
        try
        {
            var emailSettings = _configuration.GetSection("EmailSettings");
            var fromEmail = emailSettings["FromEmail"];
            var fromName = emailSettings["FromName"];
            var smtpHost = emailSettings["SmtpHost"];
            var smtpPort = int.Parse(emailSettings["SmtpPort"] ?? "587");
            var smtpUser = emailSettings["SmtpUser"];
            var smtpPassword = emailSettings["SmtpPassword"];

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = htmlBody
            };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(smtpUser, smtpPassword);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Email sent successfully to {To}", to);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To}", to);
            return false;
        }
    }

    public async Task<bool> SendEmailWithAttachmentAsync(string to, string subject, string htmlBody, byte[] attachment, string attachmentName)
    {
        try
        {
            var emailSettings = _configuration.GetSection("EmailSettings");
            var fromEmail = emailSettings["FromEmail"];
            var fromName = emailSettings["FromName"];
            var smtpHost = emailSettings["SmtpHost"];
            var smtpPort = int.Parse(emailSettings["SmtpPort"] ?? "587");
            var smtpUser = emailSettings["SmtpUser"];
            var smtpPassword = emailSettings["SmtpPassword"];

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(fromName, fromEmail));
            message.To.Add(MailboxAddress.Parse(to));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = htmlBody
            };

            // Add attachment
            await bodyBuilder.Attachments.AddAsync(attachmentName, new MemoryStream(attachment));

            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(smtpUser, smtpPassword);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Email with attachment sent successfully to {To}", to);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email with attachment to {To}", to);
            return false;
        }
    }

    public async Task<bool> SendWelcomeEmailAsync(string to, string userName, string userRole)
    {
        var subject = "Welcome to Dr. Ahmed Nabil Clinic";
        var htmlBody = EmailTemplateHelper.GetWelcomeEmail(userName, userRole);
        return await SendEmailAsync(to, subject, htmlBody);
    }

    public async Task<bool> SendAppointmentConfirmationEmailAsync(string to, string patientName, string doctorName, DateTime appointmentDate, string timeSlot)
    {
        var subject = "Appointment Confirmation - Dr. Ahmed Nabil Clinic";
        var htmlBody = EmailTemplateHelper.GetAppointmentConfirmationEmail(patientName, doctorName, appointmentDate, timeSlot);
        return await SendEmailAsync(to, subject, htmlBody);
    }

    public async Task<bool> SendAppointmentReminderEmailAsync(string to, string patientName, DateTime appointmentDate, string timeSlot)
    {
        var subject = "Appointment Reminder - Dr. Ahmed Nabil Clinic";
        var htmlBody = EmailTemplateHelper.GetAppointmentReminderEmail(patientName, appointmentDate, timeSlot);
        return await SendEmailAsync(to, subject, htmlBody);
    }

    public async Task<bool> SendPrescriptionReadyEmailAsync(string to, string patientName, string prescriptionId)
    {
        var subject = "Your Prescription is Ready - Dr. Ahmed Nabil Clinic";
        var htmlBody = EmailTemplateHelper.GetPrescriptionReadyEmail(patientName, prescriptionId);
        return await SendEmailAsync(to, subject, htmlBody);
    }

    public async Task<bool> SendPasswordResetEmailAsync(string to, string userName, string resetLink)
    {
        var subject = "Password Reset Request - Dr. Ahmed Nabil Clinic";
        var htmlBody = EmailTemplateHelper.GetPasswordResetEmail(userName, resetLink);
        return await SendEmailAsync(to, subject, htmlBody);
    }
}

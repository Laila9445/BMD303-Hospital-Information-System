using System.Text;

namespace CLINICSYSTEM.Helpers;

/// <summary>
/// Helper class for generating email templates
/// </summary>
public static class EmailTemplateHelper
{
    /// <summary>
    /// Get email template header
    /// </summary>
    private static string GetEmailHeader(string title)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{title}</title>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #007bff; color: white; padding: 20px; text-align: center; }}
        .content {{ background-color: #f9f9f9; padding: 20px; }}
        .footer {{ background-color: #333; color: white; padding: 10px; text-align: center; font-size: 12px; }}
        .button {{ background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }}
        .info-box {{ background-color: white; border-left: 4px solid #007bff; padding: 15px; margin: 10px 0; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Dr. Ahmed Nabil Clinic</h1>
            <p>Orthopedic Specialist</p>
        </div>
        <div class='content'>";
    }

    /// <summary>
    /// Get email template footer
    /// </summary>
    private static string GetEmailFooter()
    {
        return @"
        </div>
        <div class='footer'>
            <p>&copy; 2025 Dr. Ahmed Nabil Clinic. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
        </div>
    </div>
</body>
</html>";
    }

    /// <summary>
    /// Welcome email template
    /// </summary>
    public static string GetWelcomeEmail(string userName, string userRole)
    {
        var sb = new StringBuilder();
        sb.Append(GetEmailHeader("Welcome to Dr. Ahmed Nabil Clinic"));
        sb.Append($@"
            <h2>Welcome, {userName}!</h2>
            <p>Thank you for registering with Dr. Ahmed Nabil Clinic.</p>
            <p>Your account has been successfully created as a <strong>{userRole}</strong>.</p>
            <div class='info-box'>
                <p><strong>Next Steps:</strong></p>
                <ul>
                    {(userRole == "Patient" ? 
                        @"<li>Complete your medical profile</li>
                          <li>Book your first appointment</li>
                          <li>Upload any relevant medical images</li>" : 
                        @"<li>Set up your availability schedule</li>
                          <li>Review pending appointments</li>
                          <li>Update your profile information</li>")}
                </ul>
            </div>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Best regards,<br>Dr. Ahmed Nabil Clinic Team</p>");
        sb.Append(GetEmailFooter());
        return sb.ToString();
    }

    /// <summary>
    /// Appointment confirmation email template
    /// </summary>
    public static string GetAppointmentConfirmationEmail(string patientName, string doctorName, DateTime appointmentDate, string timeSlot)
    {
        var sb = new StringBuilder();
        sb.Append(GetEmailHeader("Appointment Confirmation"));
        sb.Append($@"
            <h2>Appointment Confirmed</h2>
            <p>Dear {patientName},</p>
            <p>Your appointment has been successfully booked.</p>
            <div class='info-box'>
                <p><strong>Appointment Details:</strong></p>
                <p><strong>Doctor:</strong> {doctorName}</p>
                <p><strong>Date:</strong> {appointmentDate:dddd, MMMM dd, yyyy}</p>
                <p><strong>Time:</strong> {timeSlot}</p>
            </div>
            <p><strong>Important Reminders:</strong></p>
            <ul>
                <li>Please arrive 10 minutes before your scheduled time</li>
                <li>Bring any relevant medical records or test results</li>
                <li>If you need to cancel or reschedule, please notify us at least 2 hours in advance</li>
            </ul>
            <p>We look forward to seeing you!</p>
            <p>Best regards,<br>Dr. Ahmed Nabil Clinic Team</p>");
        sb.Append(GetEmailFooter());
        return sb.ToString();
    }

    /// <summary>
    /// Appointment reminder email template
    /// </summary>
    public static string GetAppointmentReminderEmail(string patientName, DateTime appointmentDate, string timeSlot)
    {
        var sb = new StringBuilder();
        sb.Append(GetEmailHeader("Appointment Reminder"));
        sb.Append($@"
            <h2>Appointment Reminder</h2>
            <p>Dear {patientName},</p>
            <p>This is a friendly reminder about your upcoming appointment.</p>
            <div class='info-box'>
                <p><strong>Appointment Details:</strong></p>
                <p><strong>Date:</strong> {appointmentDate:dddd, MMMM dd, yyyy}</p>
                <p><strong>Time:</strong> {timeSlot}</p>
            </div>
            <p>Please arrive 10 minutes early. If you need to cancel or reschedule, please contact us as soon as possible.</p>
            <p>Best regards,<br>Dr. Ahmed Nabil Clinic Team</p>");
        sb.Append(GetEmailFooter());
        return sb.ToString();
    }

    /// <summary>
    /// Prescription ready email template
    /// </summary>
    public static string GetPrescriptionReadyEmail(string patientName, string prescriptionId)
    {
        var sb = new StringBuilder();
        sb.Append(GetEmailHeader("Prescription Ready"));
        sb.Append($@"
            <h2>Your Prescription is Ready</h2>
            <p>Dear {patientName},</p>
            <p>Your prescription (ID: {prescriptionId}) has been prepared and is now available.</p>
            <div class='info-box'>
                <p><strong>What to do next:</strong></p>
                <ul>
                    <li>Download your prescription from the patient portal</li>
                    <li>You can pick up your medications from any pharmacy</li>
                    <li>Follow the dosage instructions carefully</li>
                </ul>
            </div>
            <p>If you have any questions about your prescription, please contact us.</p>
            <p>Best regards,<br>Dr. Ahmed Nabil Clinic Team</p>");
        sb.Append(GetEmailFooter());
        return sb.ToString();
    }

    /// <summary>
    /// Password reset email template
    /// </summary>
    public static string GetPasswordResetEmail(string userName, string resetLink)
    {
        var sb = new StringBuilder();
        sb.Append(GetEmailHeader("Password Reset Request"));
        sb.Append($@"
            <h2>Password Reset Request</h2>
            <p>Dear {userName},</p>
            <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
            <p>To reset your password, click the button below:</p>
            <p><a href='{resetLink}' class='button'>Reset Password</a></p>
            <p>This link will expire in 24 hours.</p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>{resetLink}</p>
            <p>Best regards,<br>Dr. Ahmed Nabil Clinic Team</p>");
        sb.Append(GetEmailFooter());
        return sb.ToString();
    }

    /// <summary>
    /// Test results available email template
    /// </summary>
    public static string GetTestResultsEmail(string patientName, string testType)
    {
        var sb = new StringBuilder();
        sb.Append(GetEmailHeader("Test Results Available"));
        sb.Append($@"
            <h2>Your Test Results are Available</h2>
            <p>Dear {patientName},</p>
            <p>Your {testType} results are now available in your patient portal.</p>
            <div class='info-box'>
                <p><strong>Next Steps:</strong></p>
                <ul>
                    <li>Log in to your account to view the results</li>
                    <li>Schedule a follow-up appointment if needed</li>
                    <li>Contact us if you have any questions</li>
                </ul>
            </div>
            <p>Best regards,<br>Dr. Ahmed Nabil Clinic Team</p>");
        sb.Append(GetEmailFooter());
        return sb.ToString();
    }

    /// <summary>
    /// Generic notification email template
    /// </summary>
    public static string GetGenericNotificationEmail(string userName, string subject, string message)
    {
        var sb = new StringBuilder();
        sb.Append(GetEmailHeader(subject));
        sb.Append($@"
            <h2>{subject}</h2>
            <p>Dear {userName},</p>
            {message}
            <p>Best regards,<br>Dr. Ahmed Nabil Clinic Team</p>");
        sb.Append(GetEmailFooter());
        return sb.ToString();
    }
}

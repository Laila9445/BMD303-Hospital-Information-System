namespace CLINICSYSTEM.Helpers;

/// <summary>
/// Helper class for generating SMS message templates
/// Optimized for SMS character limits (160 characters for single SMS, 153 for multi-part)
/// </summary>
public static class SmsTemplateHelper
{
    private const string ClinicName = "Dr. Ahmed Nabil Clinic";
    private const string PhoneNumber = "+20 1XX XXXX XXX"; // Placeholder

    /// <summary>
    /// Appointment reminder SMS template
    /// </summary>
    public static string GetAppointmentReminderSms(string patientName, string appointmentDate, string timeSlot)
    {
        // Keep under 160 characters for single SMS
        return $"Hi {patientName}, reminder: Appointment on {appointmentDate} at {timeSlot}. Please arrive 10 mins early. {ClinicName}";
    }

    /// <summary>
    /// Verification code SMS template
    /// </summary>
    public static string GetVerificationCodeSms(string code)
    {
        // Keep under 160 characters
        return $"Your {ClinicName} verification code is: {code}. Valid for 10 minutes. Do not share this code with anyone.";
    }

    /// <summary>
    /// Appointment confirmation SMS template
    /// </summary>
    public static string GetAppointmentConfirmationSms(string doctorName, string appointmentDate, string timeSlot)
    {
        // Keep under 160 characters
        return $"Appointment confirmed with {doctorName} on {appointmentDate} at {timeSlot}. {ClinicName}";
    }

    /// <summary>
    /// Appointment cancellation SMS template
    /// </summary>
    public static string GetAppointmentCancellationSms(string patientName, string appointmentDate)
    {
        // Keep under 160 characters
        return $"Your appointment on {appointmentDate} has been cancelled. Contact us to reschedule. {ClinicName}";
    }

    /// <summary>
    /// Appointment rescheduling SMS template
    /// </summary>
    public static string GetAppointmentRescheduleeSms(string patientName, string oldDate, string newDate, string timeSlot)
    {
        // May exceed 160 characters - will send as multi-part SMS
        return $"Hi {patientName}, your appointment has been rescheduled from {oldDate} to {newDate} at {timeSlot}. {ClinicName}";
    }

    /// <summary>
    /// Prescription ready SMS template
    /// </summary>
    public static string GetPrescriptionReadySms(string patientName, string prescriptionId)
    {
        // Keep under 160 characters
        return $"Hi {patientName}, prescription {prescriptionId} is ready for pickup. Visit any pharmacy with your ID. {ClinicName}";
    }

    /// <summary>
    /// Lab results available SMS template
    /// </summary>
    public static string GetLabResultsAvailableSms(string patientName)
    {
        // Keep under 160 characters
        return $"Hi {patientName}, your lab results are ready. Login to your account or visit the clinic. {ClinicName}";
    }

    /// <summary>
    /// Payment reminder SMS template
    /// </summary>
    public static string GetPaymentReminderSms(string patientName, decimal amount)
    {
        // Keep under 160 characters
        return $"Hi {patientName}, reminder: Outstanding balance of {amount:C}. Please settle payment. {ClinicName}";
    }

    /// <summary>
    /// Welcome SMS template
    /// </summary>
    public static string GetWelcomeSms(string patientName)
    {
        // Keep under 160 characters
        return $"Welcome {patientName} to {ClinicName}! Your account is ready. Download the app or visit our website to book an appointment.";
    }

    /// <summary>
    /// Follow-up SMS template
    /// </summary>
    public static string GetFollowUpSms(string patientName)
    {
        // Keep under 160 characters
        return $"Hi {patientName}, how are you doing? Please let us know if you need any assistance. {ClinicName}";
    }

    /// <summary>
    /// Appointment on same day reminder SMS template
    /// </summary>
    public static string GetSameDayReminderSms(string patientName, string timeSlot)
    {
        // Keep under 160 characters
        return $"Today at {timeSlot}, don't forget your appointment at {ClinicName}. See you soon!";
    }

    /// <summary>
    /// Doctor availability notification SMS template
    /// </summary>
    public static string GetDoctorAvailabilitySms(string doctorName, string availableDate)
    {
        // Keep under 160 characters
        return $"Good news! {doctorName} has availability on {availableDate}. Book now at {ClinicName}";
    }

    /// <summary>
    /// Generic notification SMS template
    /// </summary>
    public static string GetGenericNotificationSms(string message)
    {
        // Keep under 160 characters
        if (message.Length > 160)
            return message.Substring(0, 157) + "...";
        return message;
    }

    /// <summary>
    /// Calculate SMS segment count based on character count
    /// Single SMS: up to 160 characters
    /// Multi-part SMS: up to 153 characters per segment (7 characters reserved for counter)
    /// </summary>
    public static int CalculateSmsSegments(string message)
    {
        if (string.IsNullOrEmpty(message))
            return 0;

        if (message.Length <= 160)
            return 1;

        // For messages > 160 chars, each segment is 153 chars (UDH takes 7 chars)
        return (int)Math.Ceiling((double)message.Length / 153);
    }

    /// <summary>
    /// Get SMS character count with indication of segments needed
    /// </summary>
    public static string GetSmsInfo(string message)
    {
        if (string.IsNullOrEmpty(message))
            return "Empty message";

        var segments = CalculateSmsSegments(message);
        var charCount = message.Length;
        var remainingChars = segments == 1 ? 160 - charCount : (segments * 153) - charCount;

        return $"Message length: {charCount} chars, Segments: {segments}, Remaining: {remainingChars} chars";
    }
}

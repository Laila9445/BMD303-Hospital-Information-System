namespace CLINICSYSTEM.Constants;

/// <summary>
/// Application-wide constants
/// </summary>
public static class AppConstants
{
    /// <summary>
    /// JWT and authentication constants
    /// </summary>
    public static class Jwt
    {
        public const int DefaultExpirationMinutes = 120;
        public const string SecretKeyMinLength = "32";
        public const string ClaimTypeUserId = "user_id";
        public const string ClaimTypeRole = "role";
    }

    /// <summary>
    /// Appointment related constants
    /// </summary>
    public static class Appointments
    {
        public const int DefaultSlotDurationMinutes = 30;
        public const int MaxAdvanceBookingDays = 90;
        public const int MinAdvanceBookingHours = 2;
        public const int CancellationWindowHours = 24;
    }

    /// <summary>
    /// Consultation constants
    /// </summary>
    public static class Consultations
    {
        public const int MaxSymptomsLength = 2000;
        public const int MaxDiagnosisLength = 2000;
        public const int MaxNotesLength = 2000;
    }

    /// <summary>
    /// Caching constants
    /// </summary>
    public static class Cache
    {
        public const int DefaultExpirationMinutes = 30;
        public const int LongExpirationHours = 24;
        public const string UserProfileKeyPrefix = "user_profile_";
        public const string DoctorScheduleKeyPrefix = "doctor_schedule_";
    }

    /// <summary>
    /// Pagination constants
    /// </summary>
    public static class Pagination
    {
        public const int DefaultPageSize = 10;
        public const int MaxPageSize = 100;
        public const int MinPageSize = 1;
    }

    /// <summary>
    /// DateTime and timezone constants
    /// </summary>
    public static class DateTime
    {
        public const string EgyptTimeZoneId = "Egypt Standard Time";
        public const string DateFormat = "yyyy-MM-dd";
        public const string TimeFormat = "HH:mm";
        public const string DateTimeFormat = "yyyy-MM-dd HH:mm:ss";
        public const string IsoDateTimeFormat = "yyyy-MM-ddTHH:mm:ss.fffZ";
    }

    /// <summary>
    /// File upload constants
    /// </summary>
    public static class Files
    {
        public const long MaxImageSizeBytes = 10 * 1024 * 1024; // 10MB
        public const long MaxDocumentSizeBytes = 25 * 1024 * 1024; // 25MB
        public static readonly string[] AllowedImageExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".bmp" };
        public static readonly string[] AllowedDocumentExtensions = { ".pdf", ".doc", ".docx", ".txt" };
        public const string UploadsPath = "uploads";
        public const string MedicalImagesPath = "uploads/medical-images";
        public const string DocumentsPath = "uploads/documents";
    }

    /// <summary>
    /// API rate limiting constants
    /// </summary>
    public static class RateLimit
    {
        public const int RequestsPerMinute = 100;
        public const int RequestsPerHour = 1000;
        public const int AuthRequestsPerMinute = 10;
    }

    /// <summary>
    /// Validation constants
    /// </summary>
    public static class Validation
    {
        public const int MinPasswordLength = 6;
        public const int MaxPasswordLength = 100;
        public const int MinNameLength = 2;
        public const int MaxNameLength = 50;
        public const int MaxEmailLength = 100;
        public const int MaxPhoneLength = 20;
        public const int MaxAddressLength = 500;
    }

    /// <summary>
    /// Email and notification constants
    /// </summary>
    public static class Notifications
    {
        public const int MaxTitleLength = 200;
        public const int MaxMessageLength = 1000;
        public const int RetentionDays = 30;
        public static readonly string[] ValidTypes = { "Info", "Appointment", "Prescription", "TestResults", "Alert", "Reminder", "Account" };
    }

    /// <summary>
    /// Medical records constants
    /// </summary>
    public static class MedicalRecords
    {
        public const int MaxHistoryLength = 2000;
        public const int MaxDescriptionLength = 500;
        public const int RetentionYears = 7;
    }
}

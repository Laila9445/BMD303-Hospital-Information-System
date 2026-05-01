namespace CLINICSYSTEM.Constants;

/// <summary>
/// Validation-related constants and messages
/// </summary>
public static class ValidationMessages
{
    // User validation
    public const string NameRequired = "Name is required.";
    public const string NameLength = "Name must be between 2 and 100 characters.";
    public const string EmailRequired = "Email is required.";
    public const string EmailInvalid = "Invalid email format.";
    public const string PasswordRequired = "Password is required.";
    public const string PasswordLength = "Password must be between 8 and 100 characters.";
    public const string PhoneRequired = "Phone number is required.";
    public const string PhoneInvalid = "Invalid phone number format. Use format: +20XXXXXXXXXX or 01XXXXXXXXX";

    // Patient validation
    public const string DateOfBirthRequired = "Date of birth is required.";
    public const string DateOfBirthInvalid = "Date of birth cannot be in the future.";
    public const string GenderRequired = "Gender is required.";
    public const string AddressRequired = "Address is required.";
    public const string AddressLength = "Address must be between 5 and 200 characters.";

    // Appointment validation
    public const string AppointmentDateRequired = "Appointment date is required.";
    public const string AppointmentTimeRequired = "Appointment time is required.";
    public const string AppointmentDateInvalid = "Appointment date must be in the future.";
    public const string DoctorIdRequired = "Doctor ID is required.";
    public const string ReasonLength = "Reason must not exceed 500 characters.";

    // Consultation validation
    public const string SymptomsRequired = "Symptoms are required.";
    public const string SymptomsLength = "Symptoms must be between 10 and 2000 characters.";
    public const string DiagnosisRequired = "Diagnosis is required.";
    public const string DiagnosisLength = "Diagnosis must be between 10 and 2000 characters.";
    public const string NotesLength = "Notes must not exceed 2000 characters.";

    // Prescription validation
    public const string MedicationNameRequired = "Medication name is required.";
    public const string MedicationNameLength = "Medication name must be between 2 and 200 characters.";
    public const string DosageRequired = "Dosage is required.";
    public const string DosageLength = "Dosage must be between 2 and 100 characters.";
    public const string FrequencyRequired = "Frequency is required.";
    public const string FrequencyLength = "Frequency must be between 2 and 100 characters.";
    public const string DurationRequired = "Duration is required.";
    public const string DurationLength = "Duration must be between 2 and 50 characters.";
    public const string InstructionsLength = "Instructions must not exceed 1000 characters.";

    // Medical Image validation
    public const string ImageTypeRequired = "Image type is required.";
    public const string ImageTypeLength = "Image type must be between 2 and 50 characters.";
    public const string FilePathRequired = "File path is required.";
    public const string DescriptionLength = "Description must not exceed 500 characters.";

    // File upload validation
    public const string FileRequired = "File is required.";
    public const string FileSizeExceeded = "File size must not exceed {0}MB.";
    public const string InvalidFileExtension = "File must be of type: {0}";
    public const string AllowedImageExtensions = ".jpg, .jpeg, .png, .dcm";
    public const string AllowedDocumentExtensions = ".pdf, .doc, .docx";

    // Schedule validation
    public const string DayOfWeekRequired = "Day of week is required.";
    public const string DayOfWeekInvalid = "Day of week must be between 0 (Sunday) and 6 (Saturday).";
    public const string StartTimeRequired = "Start time is required.";
    public const string EndTimeRequired = "End time is required.";
    public const string EndTimeBeforeStartTime = "End time must be after start time.";

    // Notification validation
    public const string MessageRequired = "Message is required.";
    public const string MessageLength = "Message must be between 1 and 1000 characters.";
    public const string NotificationTypeRequired = "Notification type is required.";

    // General validation
    public const string IdRequired = "ID is required.";
    public const string IdInvalid = "Invalid ID format.";
    public const string StatusRequired = "Status is required.";
    public const string DateRangeInvalid = "End date must be after start date.";
}

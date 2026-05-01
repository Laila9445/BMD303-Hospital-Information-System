namespace CLINICSYSTEM.Constants;

/// <summary>
/// Centralized error messages for the application
/// </summary>
public static class ErrorMessages
{
    // Authentication & Authorization
    public const string InvalidCredentials = "Invalid email or password.";
    public const string EmailAlreadyExists = "An account with this email already exists.";
    public const string UserNotFound = "User not found.";
    public const string Unauthorized = "You are not authorized to perform this action.";
    public const string InvalidToken = "Invalid or expired token.";
    public const string AccountLocked = "Your account has been locked due to multiple failed login attempts.";

    // Patient-related
    public const string PatientNotFound = "Patient not found.";
    public const string PatientProfileUpdateFailed = "Failed to update patient profile.";
    public const string InvalidPatientId = "Invalid patient ID.";

    // Doctor-related
    public const string DoctorNotFound = "Doctor not found.";
    public const string DoctorNotAvailable = "Doctor is not available at this time.";
    public const string InvalidDoctorId = "Invalid doctor ID.";

    // Appointment-related
    public const string AppointmentNotFound = "Appointment not found.";
    public const string AppointmentAlreadyBooked = "This time slot is already booked.";
    public const string AppointmentCannotBeCancelled = "Appointment cannot be cancelled within 1 hour of scheduled time.";
    public const string AppointmentCannotBeRescheduled = "Appointment cannot be rescheduled within 2 hours of scheduled time.";
    public const string InvalidAppointmentDate = "Appointment date must be in the future.";
    public const string InvalidAppointmentTime = "Invalid appointment time.";
    public const string AppointmentInPast = "Cannot book appointments in the past.";
    public const string NoAvailableSlots = "No available time slots for the selected date.";

    // Consultation-related
    public const string ConsultationNotFound = "Consultation not found.";
    public const string ConsultationAlreadyCompleted = "This consultation has already been completed.";
    public const string ConsultationCannotBeStarted = "Consultation cannot be started at this time.";
    public const string InvalidConsultationId = "Invalid consultation ID.";

    // Prescription-related
    public const string PrescriptionNotFound = "Prescription not found.";
    public const string PrescriptionGenerationFailed = "Failed to generate prescription PDF.";
    public const string InvalidPrescriptionId = "Invalid prescription ID.";
    public const string NoMedicationsInPrescription = "Prescription must contain at least one medication.";
    public const string TooManyMedications = "Prescription cannot contain more than 10 medications.";

    // Medical Image-related
    public const string MedicalImageNotFound = "Medical image not found.";
    public const string ImageUploadFailed = "Failed to upload medical image.";
    public const string InvalidImageFormat = "Invalid image format. Allowed formats: JPG, PNG, DICOM.";
    public const string ImageTooLarge = "Image file size exceeds the maximum limit of 10MB.";

    // Notification-related
    public const string NotificationNotFound = "Notification not found.";
    public const string NotificationSendFailed = "Failed to send notification.";

    // Validation errors
    public const string RequiredField = "This field is required.";
    public const string InvalidEmail = "Please provide a valid email address.";
    public const string InvalidPhoneNumber = "Please provide a valid phone number.";
    public const string InvalidDateFormat = "Invalid date format. Use yyyy-MM-dd.";
    public const string PasswordTooShort = "Password must be at least 8 characters long.";
    public const string PasswordRequiresUppercase = "Password must contain at least one uppercase letter.";
    public const string PasswordRequiresLowercase = "Password must contain at least one lowercase letter.";
    public const string PasswordRequiresDigit = "Password must contain at least one digit.";
    public const string PasswordRequiresSpecialChar = "Password must contain at least one special character.";

    // File upload errors
    public const string FileRequired = "File is required.";
    public const string InvalidFileExtension = "Invalid file extension.";
    public const string FileSizeExceeded = "File size exceeds the maximum allowed size.";

    // Database errors
    public const string DatabaseError = "A database error occurred. Please try again later.";
    public const string RecordNotFound = "Record not found.";
    public const string DuplicateEntry = "A record with this information already exists.";

    // General errors
    public const string InternalServerError = "An unexpected error occurred. Please try again later.";
    public const string InvalidRequest = "Invalid request.";
    public const string OperationFailed = "Operation failed. Please try again.";
    public const string ResourceNotFound = "The requested resource was not found.";
}

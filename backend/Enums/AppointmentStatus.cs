namespace CLINICSYSTEM.Enums;

/// <summary>
/// Represents the status of an appointment in the clinic system
/// </summary>
public enum AppointmentStatus
{
    /// <summary>
    /// Appointment has been scheduled but not yet confirmed
    /// </summary>
    Scheduled = 0,

    /// <summary>
    /// Appointment has been confirmed by the clinic
    /// </summary>
    Confirmed = 1,

    /// <summary>
    /// Patient has checked in and is waiting
    /// </summary>
    CheckedIn = 2,

    /// <summary>
    /// Doctor is currently consulting with the patient
    /// </summary>
    InProgress = 3,

    /// <summary>
    /// Appointment has been completed
    /// </summary>
    Completed = 4,

    /// <summary>
    /// Appointment was cancelled by patient or doctor
    /// </summary>
    Cancelled = 5,

    /// <summary>
    /// Patient did not show up for the appointment
    /// </summary>
    NoShow = 6,

    /// <summary>
    /// Appointment was rescheduled to a different time
    /// </summary>
    Rescheduled = 7
}

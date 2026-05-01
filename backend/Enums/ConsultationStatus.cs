namespace CLINICSYSTEM.Enums;

/// <summary>
/// Represents the status of a medical consultation
/// </summary>
public enum ConsultationStatus
{
    /// <summary>
    /// Consultation has started but not yet completed
    /// </summary>
    InProgress = 0,

    /// <summary>
    /// Consultation has been completed and notes saved
    /// </summary>
    Completed = 1,

    /// <summary>
    /// Consultation requires follow-up visit
    /// </summary>
    FollowUpRequired = 2,

    /// <summary>
    /// Consultation was cancelled or aborted
    /// </summary>
    Cancelled = 3
}

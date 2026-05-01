namespace CLINICSYSTEM.Enums;

/// <summary>
/// Represents the status of a prescription
/// </summary>
public enum PrescriptionStatus
{
    /// <summary>
    /// Prescription has been created but not yet dispensed
    /// </summary>
    Pending = 0,

    /// <summary>
    /// Prescription is being filled at the pharmacy
    /// </summary>
    Processing = 1,

    /// <summary>
    /// Prescription is ready for patient pickup
    /// </summary>
    ReadyForPickup = 2,

    /// <summary>
    /// Prescription has been dispensed to the patient
    /// </summary>
    Dispensed = 3,

    /// <summary>
    /// Prescription was cancelled by the doctor
    /// </summary>
    Cancelled = 4,

    /// <summary>
    /// Prescription has expired and is no longer valid
    /// </summary>
    Expired = 5
}

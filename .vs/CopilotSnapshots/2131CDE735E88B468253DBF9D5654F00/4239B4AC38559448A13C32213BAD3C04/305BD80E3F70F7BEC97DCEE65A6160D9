namespace CLINICSYSTEM.Models
{
    /// <summary>
    /// Referral model for managing patient referrals to external services (Physiotherapy, Radiology, etc.)
    /// Supports external system integration with status tracking and service communication
    /// </summary>
    public class ReferralModel
    {
        /// <summary>
        /// Unique identifier for the referral
        /// </summary>
        public int ReferralId { get; set; }

        /// <summary>
        /// External patient ID (from Patient Portal or external system)
        /// Used for integration across multiple systems
        /// </summary>
        public string PatientExternalId { get; set; } = string.Empty;

        /// <summary>
        /// ID of the doctor who referred the patient
        /// </summary>
        public int DoctorId { get; set; }

        /// <summary>
        /// Type of referral (e.g., Physiotherapy, Radiology, Orthopedic Specialist)
        /// </summary>
        public string ReferralType { get; set; } = string.Empty;

        /// <summary>
        /// Reason for the referral
        /// </summary>
        public string Reason { get; set; } = string.Empty;

        /// <summary>
        /// Patient diagnosis or clinical findings
        /// </summary>
        public string Diagnosis { get; set; } = string.Empty;

        /// <summary>
        /// Recommended treatment or service requested
        /// </summary>
        public string RecommendedTreatment { get; set; } = string.Empty;

        /// <summary>
        /// Priority level: Low, Normal, High, Urgent
        /// </summary>
        public string Priority { get; set; } = "Normal";

        /// <summary>
        /// Status of the referral:
        /// - Pending: Created but not sent
        /// - Sent: Sent to external service
        /// - Accepted: Accepted by external service
        /// - InProgress: Service in progress
        /// - Completed: Service completed
        /// - Cancelled: Referral cancelled
        /// </summary>
        public string Status { get; set; } = "Pending";

        /// <summary>
        /// Additional notes from the referring doctor
        /// </summary>
        public string? DoctorNotes { get; set; }

        /// <summary>
        /// External referral ID from the external service
        /// Used to track referral in external system
        /// </summary>
        public string? ExternalReferralId { get; set; }

        /// <summary>
        /// URL of the external service that received the referral
        /// </summary>
        public string? ExternalServiceUrl { get; set; }

        /// <summary>
        /// Feedback or response from the external service
        /// </summary>
        public string? ExternalServiceFeedback { get; set; }

        /// <summary>
        /// Timestamp when referral was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Timestamp when referral was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; }

        /// <summary>
        /// Timestamp when referral was sent to external service
        /// </summary>
        public DateTime? SentAt { get; set; }

        /// <summary>
        /// Timestamp when referral was accepted by external service
        /// </summary>
        public DateTime? AcceptedAt { get; set; }

        /// <summary>
        /// Timestamp when referral service was completed
        /// </summary>
        public DateTime? CompletedAt { get; set; }

        // Navigation properties
        /// <summary>
        /// Navigation property to the referring doctor
        /// </summary>
        public DoctorModel? Doctor { get; set; }
    }
}
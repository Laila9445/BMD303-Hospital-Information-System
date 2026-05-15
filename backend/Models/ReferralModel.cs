using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CLINICSYSTEM.Models
{
    /// <summary>
    /// Referral model for managing patient referrals to external services (Physiotherapy, Radiology, etc.)
    /// Supports external system integration with status tracking and service communication
    /// </summary>
    public class ReferralModel
    {
        [Key]
        public int ReferralId { get; set; }

        public int PatientId { get; set; }
        [ForeignKey("PatientId")]
        public UserModel? Patient { get; set; }

        public string PatientExternalId { get; set; } = string.Empty;

        public string PatientName { get; set; } = string.Empty;

        public int DoctorId { get; set; }
        [ForeignKey("DoctorId")]
        public UserModel? Doctor { get; set; }

        [Required]
        public string DoctorName { get; set; } = string.Empty;

        [Required]
        public string ReferralType { get; set; } = string.Empty;

        [Required]
        public string Department { get; set; } = string.Empty;

        [Required]
        public string AssignedToRole { get; set; } = string.Empty;

        [Required]
        public string Urgency { get; set; } = "Routine";

        [Required]
        public string Reason { get; set; } = string.Empty;

        public string? Notes { get; set; }

        public string Status { get; set; } = "Pending";

        public int? LinkedAppointmentId { get; set; }
        [ForeignKey("LinkedAppointmentId")]
        public AppointmentModel? LinkedAppointment { get; set; }

        public string? CompletionNotes { get; set; }

        public string? CancellationReason { get; set; }

        public bool ReportAttached { get; set; } = false;

        public string? FhirServiceRequestId { get; set; }

        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}

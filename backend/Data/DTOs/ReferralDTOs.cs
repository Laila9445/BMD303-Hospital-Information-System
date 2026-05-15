using System.ComponentModel.DataAnnotations;

namespace CLINICSYSTEM.Data.DTOs
{
    public class CreateReferralRequest
    {
        [Required]
        public int PatientId { get; set; }
        [Required]
        public int DoctorId { get; set; }
        [Required]
        public string ReferralType { get; set; }
        [Required]
        public string Urgency { get; set; }
        [Required]
        public string Reason { get; set; }
        public string? Notes { get; set; }
    }

    public class ReferralDTO
    {
        public int id => ReferralId;
        public int ReferralId { get; set; }
        public int PatientId { get; set; }
        public string PatientName { get; set; }
        public string PatientExternalId { get; set; }
        public int DoctorId { get; set; }
        public string DoctorName { get; set; }
        public string ReferralType { get; set; }
        public string Department { get; set; }
        public string AssignedToRole { get; set; }
        public string Urgency { get; set; }
        public string Reason { get; set; }
        public string? Notes { get; set; }
        public string Status { get; set; }
        public int? LinkedAppointmentId { get; set; }
        public string? CompletionNotes { get; set; }
        public string? CancellationReason { get; set; }
        public bool ReportAttached { get; set; }
        public string? FhirServiceRequestId { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class UpdateReferralStatusRequest
    {
        [Required]
        public string Status { get; set; }
        public string? CompletionNotes { get; set; }
        public string? CancellationReason { get; set; }
    }

    public class ExternalReferralResponse
    {
        public string? ReferralId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Message { get; set; }
    }

    public class ReferralStatsDTO
    {
        public int Total { get; set; }
        public int Pending { get; set; }
        public int Accepted { get; set; }
        public int AppointmentBooked { get; set; }
        public int Completed { get; set; }
        public int Cancelled { get; set; }
        public Dictionary<string, int> ByUrgency { get; set; } = new();
        public Dictionary<string, int> ByDepartment { get; set; } = new();
    }
}

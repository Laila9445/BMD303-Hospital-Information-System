using System.ComponentModel.DataAnnotations;

namespace CLINICSYSTEM.Data.DTOs
{
   
    public class CreateReferralRequest
    {
        [Required(ErrorMessage = "Patient External ID is required")]
        public string PatientExternalId { get; set; } = string.Empty;

        [Required(ErrorMessage = "Doctor ID is required")]
        public int DoctorId { get; set; }

        [Required(ErrorMessage = "Referral type is required")]
        public string ReferralType { get; set; } = "Physiotherapy";

        [Required(ErrorMessage = "Reason is required")]
        [StringLength(500, ErrorMessage = "Reason cannot exceed 500 characters")]
        public string Reason { get; set; } = string.Empty;

        [Required(ErrorMessage = "Diagnosis is required")]
        [StringLength(1000, ErrorMessage = "Diagnosis cannot exceed 1000 characters")]
        public string Diagnosis { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "Recommended treatment cannot exceed 1000 characters")]
        public string RecommendedTreatment { get; set; } = string.Empty;

        [Required(ErrorMessage = "Priority is required")]
        [RegularExpression("Low|Normal|High|Urgent", ErrorMessage = "Priority must be: Low, Normal, High, or Urgent")]
        public string Priority { get; set; } = "Normal";

        [StringLength(2000, ErrorMessage = "Doctor notes cannot exceed 2000 characters")]
        public string? DoctorNotes { get; set; }

       
        public bool AutoSend { get; set; } = true;
    }

    public class ReferralDTO
    {
        public int ReferralId { get; set; }
        public string PatientExternalId { get; set; } = string.Empty;
        public int DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public string ReferralType { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string Diagnosis { get; set; } = string.Empty;
        public string RecommendedTreatment { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? ExternalReferralId { get; set; }
        public string? ExternalServiceUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? SentAt { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? DoctorNotes { get; set; }
        public string? ExternalServiceFeedback { get; set; }
    }

   
    public class UpdateReferralStatusRequest
    {
        [Required(ErrorMessage = "Status is required")]
        [RegularExpression("Pending|Sent|Accepted|InProgress|Completed|Cancelled", 
            ErrorMessage = "Invalid status value")]
        public string Status { get; set; } = string.Empty;

        [StringLength(2000, ErrorMessage = "Feedback cannot exceed 2000 characters")]
        public string? Feedback { get; set; }
    }

   
    public class ExternalReferralResponse
    {
        public string? ReferralId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Message { get; set; }
    }
}

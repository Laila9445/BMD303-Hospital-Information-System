using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CLINICSYSTEM.Models
{
    public class RadiologyStudy
    {
        [Key]
        public int Id { get; set; }

        public int PatientId { get; set; }
        [ForeignKey(nameof(PatientId))]
        public UserModel? Patient { get; set; }

        public int RadiologistId { get; set; }
        [ForeignKey(nameof(RadiologistId))]
        public UserModel? Radiologist { get; set; }

        public int? ReferralId { get; set; }
        [ForeignKey(nameof(ReferralId))]
        public ReferralModel? Referral { get; set; }

        [Required]
        [StringLength(50)]
        public string StudyType { get; set; } = string.Empty;

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Pending";

        public DateTime? StudyDate { get; set; }

        [StringLength(2000)]
        public string? Notes { get; set; }

        public bool BillingCreated { get; set; }
        [StringLength(50)]
        public string? BillingInvoiceId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}

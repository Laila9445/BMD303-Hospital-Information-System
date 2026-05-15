using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CLINICSYSTEM.Models
{
    public class BillingInvoice
    {
        [Key]
        [StringLength(50)]
        public string Id { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string PatientId { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string PatientName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Department { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string ServiceId { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string ServiceName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Type { get; set; } = "Consultation";

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Pending";

        [Required]
        public DateTime Date { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPaid { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal RemainingAmount { get; set; }

        [StringLength(50)]
        public string? InsuranceId { get; set; }

        [StringLength(200)]
        public string? InsuranceName { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? InsuranceCoverage { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? InsuranceDiscount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? FinalAmount { get; set; }

        [StringLength(500)]
        public string? CancellationReason { get; set; }

        [StringLength(50)]
        public string? ReferenceType { get; set; }

        [StringLength(50)]
        public string? ReferenceId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<BillingPayment> Payments { get; set; } = new List<BillingPayment>();
    }
}

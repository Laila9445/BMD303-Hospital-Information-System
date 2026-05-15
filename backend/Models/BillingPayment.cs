using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CLINICSYSTEM.Models
{
    public class BillingPayment
    {
        [Key]
        [StringLength(50)]
        public string Id { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string InvoiceId { get; set; } = string.Empty;

        [ForeignKey(nameof(InvoiceId))]
        public BillingInvoice? BillingInvoice { get; set; }

        [Required]
        [StringLength(50)]
        public string PatientId { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string PatientName { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(20)]
        public string Method { get; set; } = string.Empty;

        [Required]
        public DateTime Date { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

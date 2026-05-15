using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CLINICSYSTEM.Models
{
    public class BillingInvoiceItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(50)]
        public string BillingInvoiceId { get; set; } = string.Empty;
        public BillingInvoice? BillingInvoice { get; set; }

        [Required]
        [StringLength(50)]
        public string ServiceId { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string ServiceName { get; set; } = string.Empty;

        [Required]
        public int Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }
    }
}

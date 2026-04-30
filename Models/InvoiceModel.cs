using Billing_Backend.Enums;

namespace Billing_Backend.Models
{
    /// <summary>
    /// Represents a billing invoice for a patient's services
    /// </summary>
    public class InvoiceModel
    {
        public int InvoiceId { get; set; }
        
        /// <summary>
        /// Can be from internal PatientModel or ExternalPatientId
        /// </summary>
        public int? PatientId { get; set; }
        public string? PatientExternalId { get; set; }
        
        public InvoiceStatus Status { get; set; } = InvoiceStatus.Pending;
        
        public decimal TotalAmount { get; set; }
        
        /// <summary>
        /// Amount paid so far
        /// </summary>
        public decimal PaidAmount { get; set; }
        
        /// <summary>
        /// Unique key for idempotent event processing
        /// </summary>
        public string? IdempotencyKey { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? PaidAt { get; set; }
        
        /// <summary>
        /// Track which service system created this invoice
        /// </summary>
        public string? SourceSystem { get; set; }
        
        // Navigation properties
        public ICollection<InvoiceItemModel>? Items { get; set; }
        public ICollection<PaymentModel>? Payments { get; set; }
    }
}

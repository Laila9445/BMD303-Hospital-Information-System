using Billing_Backend.Enums;

namespace Billing_Backend.Models
{
    /// <summary>
    /// Represents a payment record for an invoice
    /// </summary>
    public class PaymentModel
    {
        public int PaymentId { get; set; }
        
        public int InvoiceId { get; set; }
        
        public decimal Amount { get; set; }
        
        public PaymentMethod PaymentMethod { get; set; }
        
        /// <summary>
        /// Transaction ID from payment gateway (e.g., Stripe, PayPal)
        /// </summary>
        public string? TransactionId { get; set; }
        
        /// <summary>
        /// Reference number for receipts
        /// </summary>
        public string? ReferenceNumber { get; set; }
        
        public PaymentStatus Status { get; set; } = PaymentStatus.Completed;
        
        public DateTime PaidAt { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        /// <summary>
        /// Additional notes or reason (e.g., refund reason)
        /// </summary>
        public string? Notes { get; set; }
        
        // Navigation properties
        public InvoiceModel? Invoice { get; set; }
    }
}

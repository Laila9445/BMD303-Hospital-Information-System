using Billing_Backend.Enums;

namespace Billing_Backend.Data.DTOs
{
    /// <summary>
    /// Event received from other services (Appointments, Consultations, etc.)
    /// </summary>
    public class ServiceEventDto
    {
        /// <summary>
        /// Patient ID (can be internal or external)
        /// </summary>
        public int? PatientId { get; set; }
        public string? PatientExternalId { get; set; }
        
        /// <summary>
        /// Name of the service being billed
        /// </summary>
        public string ServiceName { get; set; } = string.Empty;
        
        /// <summary>
        /// Price of the service
        /// </summary>
        public decimal Price { get; set; }
        
        /// <summary>
        /// Optional: Additional description
        /// </summary>
        public string? Description { get; set; }
        
        /// <summary>
        /// Quantity (default 1)
        /// </summary>
        public int Quantity { get; set; } = 1;
        
        /// <summary>
        /// Reference to the original service record
        /// </summary>
        public int? ReferenceId { get; set; }
        
        /// <summary>
        /// Type of service (e.g., "Appointment", "Consultation", "Imaging", "Therapy")
        /// </summary>
        public string? ReferenceType { get; set; }
        
        /// <summary>
        /// Unique key to prevent duplicate processing
        /// </summary>
        public string? IdempotencyKey { get; set; }
        
        /// <summary>
        /// Source system that generated the event
        /// </summary>
        public string? SourceSystem { get; set; }
    }

    // ===== Invoice DTOs =====
    
    public class InvoiceDto
    {
        public int InvoiceId { get; set; }
        public int? PatientId { get; set; }
        public string? PatientExternalId { get; set; }
        public InvoiceStatus Status { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? PaidAt { get; set; }
        public string? SourceSystem { get; set; }
        public List<InvoiceItemDto>? Items { get; set; }
    }

    public class InvoiceItemDto
    {
        public int InvoiceItemId { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public int? ReferenceId { get; set; }
        public string? ReferenceType { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateInvoiceItemDto
    {
        public string ServiceName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; } = 1;
        public int? ReferenceId { get; set; }
        public string? ReferenceType { get; set; }
    }

    // ===== Payment DTOs =====
    
    public class PaymentDto
    {
        public int PaymentId { get; set; }
        public int InvoiceId { get; set; }
        public decimal Amount { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public string? TransactionId { get; set; }
        public string? ReferenceNumber { get; set; }
        public PaymentStatus Status { get; set; }
        public DateTime PaidAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Notes { get; set; }
    }

    public class CreatePaymentDto
    {
        public int InvoiceId { get; set; }
        public decimal Amount { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public string? TransactionId { get; set; }
        public string? Notes { get; set; }
    }

    // ===== Invoice Summary DTOs =====
    
    public class InvoiceSummaryDto
    {
        public int TotalInvoices { get; set; }
        public int PaidInvoices { get; set; }
        public int PendingInvoices { get; set; }
        public int PartialInvoices { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal PendingAmount { get; set; }
    }

    // ===== Patient Invoice Summary =====
    
    public class PatientInvoiceSummaryDto
    {
        public int? PatientId { get; set; }
        public string? PatientExternalId { get; set; }
        public int TotalInvoices { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal OutstandingAmount { get; set; }
        public InvoiceStatus OverallStatus { get; set; }
        public List<InvoiceDto>? RecentInvoices { get; set; }
    }
}

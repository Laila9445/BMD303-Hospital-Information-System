namespace Billing_Backend.Models
{
    /// <summary>
    /// Represents a line item in an invoice
    /// </summary>
    public class InvoiceItemModel
    {
        public int InvoiceItemId { get; set; }
        
        public int InvoiceId { get; set; }
        
        public string ServiceName { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        public decimal Price { get; set; }
        
        /// <summary>
        /// Quantity of service (default 1)
        /// </summary>
        public int Quantity { get; set; } = 1;
        
        /// <summary>
        /// Reference to service (e.g., AppointmentId, ConsultationId, etc.)
        /// </summary>
        public int? ReferenceId { get; set; }
        
        /// <summary>
        /// Type of service for reference (e.g., "Appointment", "Consultation", "Imaging")
        /// </summary>
        public string? ReferenceType { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public InvoiceModel? Invoice { get; set; }
    }
}

using System.ComponentModel.DataAnnotations;

namespace CLINICSYSTEM.Data.DTOs
{
    public class BillingServiceDTO
    {
        public string Id { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; } = "Active";
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateBillingServiceRequest
    {
        [Required]
        public string ServiceName { get; set; } = string.Empty;
        [Required]
        public string Department { get; set; } = string.Empty;
        [Required]
        public decimal Price { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
    }

    public class UpdateBillingServiceRequest
    {
        public string? ServiceName { get; set; }
        public string? Department { get; set; }
        public decimal? Price { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
    }

    public class BillingInvoiceDTO
    {
        public string Id { get; set; } = string.Empty;
        public string PatientId { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string ServiceId { get; set; } = string.Empty;
        public string ServiceName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
        public decimal Price { get; set; }
        public decimal TotalPaid { get; set; }
        public decimal RemainingAmount { get; set; }
        public string? InsuranceId { get; set; }
        public string? InsuranceName { get; set; }
        public decimal? InsuranceCoverage { get; set; }
        public decimal? InsuranceDiscount { get; set; }
        public decimal? FinalAmount { get; set; }
        public string? CancellationReason { get; set; }
        public string? ReferenceType { get; set; }
        public string? ReferenceId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateBillingInvoiceRequest
    {
        [Required]
        public string PatientId { get; set; } = string.Empty;
        [Required]
        public string PatientName { get; set; } = string.Empty;
        [Required]
        public string Department { get; set; } = string.Empty;
        [Required]
        public string ServiceId { get; set; } = string.Empty;
        [Required]
        public string ServiceName { get; set; } = string.Empty;
        public string? Type { get; set; }
        public string? Status { get; set; }
        public DateTime? Date { get; set; }
        public decimal? Amount { get; set; }
        public decimal Price { get; set; }
        public string? InsuranceId { get; set; }
        public string? InsuranceName { get; set; }
        public decimal? InsuranceCoverage { get; set; }
        public decimal? InsuranceDiscount { get; set; }
        public decimal? FinalAmount { get; set; }
        public string? ReferenceType { get; set; }
        public string? ReferenceId { get; set; }
    }

    public class UpdateBillingInvoiceStatusRequest
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }

    public class CancelBillingInvoiceRequest
    {
        [Required]
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = "Cancelled";
    }

    public class BillingPaymentDTO
    {
        public string Id { get; set; } = string.Empty;
        public string InvoiceId { get; set; } = string.Empty;
        public string PatientId { get; set; } = string.Empty;
        public string PatientName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Method { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class RecordBillingPaymentRequest
    {
        [Required]
        public string InvoiceId { get; set; } = string.Empty;
        [Required]
        public decimal Amount { get; set; }
        [Required]
        public string Method { get; set; } = string.Empty;
        [Required]
        public string PatientId { get; set; } = string.Empty;
        [Required]
        public string PatientName { get; set; } = string.Empty;
    }

    public class BillingPaymentResultDTO
    {
        public BillingPaymentDTO Payment { get; set; } = new();
        public BillingInvoiceDTO Invoice { get; set; } = new();
    }
}

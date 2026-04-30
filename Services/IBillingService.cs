using Billing_Backend.Data.DTOs;
using Billing_Backend.Enums;

namespace Billing_Backend.Services
{
    public interface IBillingService
    {
        // Service Event Handling
        Task<InvoiceDto> ProcessServiceEventAsync(ServiceEventDto eventDto);
        
        // Invoice Operations
        Task<InvoiceDto?> GetInvoiceAsync(int invoiceId);
        Task<List<InvoiceDto>> GetPatientInvoicesAsync(int patientId);
        Task<List<InvoiceDto>> GetPatientInvoicesByExternalIdAsync(string patientExternalId);
        Task<List<InvoiceDto>> GetInvoicesByStatusAsync(InvoiceStatus status);
        
        // Payment Operations
        Task<PaymentDto> ProcessPaymentAsync(CreatePaymentDto paymentDto);
        Task<List<PaymentDto>> GetInvoicePaymentsAsync(int invoiceId);
        
        // Summaries and Reports
        Task<InvoiceSummaryDto> GetInvoiceSummaryAsync();
        Task<PatientInvoiceSummaryDto> GetPatientInvoiceSummaryAsync(int patientId);
        Task<PatientInvoiceSummaryDto> GetPatientInvoiceSummaryByExternalIdAsync(string patientExternalId);
    }
}

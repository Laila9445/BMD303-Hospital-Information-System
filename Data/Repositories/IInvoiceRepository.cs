using Billing_Backend.Models;

namespace Billing_Backend.Data.Repositories
{
    public interface IInvoiceRepository
    {
        Task<InvoiceModel?> GetInvoiceByIdAsync(int invoiceId);
        Task<InvoiceModel?> GetInvoiceByIdempotencyKeyAsync(string idempotencyKey);
        Task<List<InvoiceModel>> GetPatientInvoicesAsync(int patientId);
        Task<List<InvoiceModel>> GetPatientInvoicesByExternalIdAsync(string patientExternalId);
        Task<List<InvoiceModel>> GetInvoicesByStatusAsync(Billing_Backend.Enums.InvoiceStatus status);
        Task<List<InvoiceModel>> GetInvoicesByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<InvoiceModel> CreateInvoiceAsync(InvoiceModel invoice);
        Task<InvoiceModel> UpdateInvoiceAsync(InvoiceModel invoice);
        Task<bool> DeleteInvoiceAsync(int invoiceId);
        Task<bool> InvoiceExistsAsync(int invoiceId);
    }
}

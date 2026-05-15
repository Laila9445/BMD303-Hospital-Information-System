using CLINICSYSTEM.Data.DTOs;

namespace CLINICSYSTEM.Services
{
    public interface IBillingService
    {
        Task<List<BillingServiceDTO>> GetAllServicesAsync();
        Task<BillingServiceDTO> CreateServiceAsync(CreateBillingServiceRequest request);
        Task<BillingServiceDTO> UpdateServiceAsync(string id, UpdateBillingServiceRequest request);
        Task<BillingServiceDTO> ToggleServiceAsync(string id);

        Task<List<BillingInvoiceDTO>> GetInvoicesAsync(int? userId, string? role);
        Task<BillingInvoiceDTO?> GetInvoiceByIdAsync(string id);
        Task<BillingInvoiceDTO> CreateInvoiceAsync(CreateBillingInvoiceRequest request);
        Task<BillingInvoiceDTO> UpdateInvoiceStatusAsync(string id, UpdateBillingInvoiceStatusRequest request);
        Task<BillingInvoiceDTO> CancelInvoiceAsync(string id, CancelBillingInvoiceRequest request);

        Task<List<BillingPaymentDTO>> GetPaymentsAsync(int? userId, string? role);
        Task<BillingPaymentResultDTO> RecordPaymentAsync(RecordBillingPaymentRequest request);
    }
}

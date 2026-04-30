using Billing_Backend.Models;

namespace Billing_Backend.Data.Repositories
{
    public interface IPaymentRepository
    {
        Task<PaymentModel?> GetPaymentByIdAsync(int paymentId);
        Task<List<PaymentModel>> GetInvoicePaymentsAsync(int invoiceId);
        Task<List<PaymentModel>> GetPaymentsByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<PaymentModel?> GetPaymentByTransactionIdAsync(string transactionId);
        Task<PaymentModel> CreatePaymentAsync(PaymentModel payment);
        Task<PaymentModel> UpdatePaymentAsync(PaymentModel payment);
        Task<bool> DeletePaymentAsync(int paymentId);
    }
}

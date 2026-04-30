using Billing_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Billing_Backend.Data.Repositories
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly BillingDbContext _context;
        private readonly ILogger<PaymentRepository> _logger;

        public PaymentRepository(BillingDbContext context, ILogger<PaymentRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<PaymentModel?> GetPaymentByIdAsync(int paymentId)
        {
            try
            {
                return await _context.Payments
                    .Include(p => p.Invoice)
                    .FirstOrDefaultAsync(p => p.PaymentId == paymentId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving payment {PaymentId}", paymentId);
                throw;
            }
        }

        public async Task<List<PaymentModel>> GetInvoicePaymentsAsync(int invoiceId)
        {
            try
            {
                return await _context.Payments
                    .Where(p => p.InvoiceId == invoiceId)
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving payments for invoice {InvoiceId}", invoiceId);
                throw;
            }
        }

        public async Task<List<PaymentModel>> GetPaymentsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                return await _context.Payments
                    .Where(p => p.CreatedAt >= startDate && p.CreatedAt <= endDate)
                    .OrderByDescending(p => p.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving payments for date range");
                throw;
            }
        }

        public async Task<PaymentModel?> GetPaymentByTransactionIdAsync(string transactionId)
        {
            try
            {
                return await _context.Payments
                    .FirstOrDefaultAsync(p => p.TransactionId == transactionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving payment by transaction ID");
                throw;
            }
        }

        public async Task<PaymentModel> CreatePaymentAsync(PaymentModel payment)
        {
            try
            {
                payment.CreatedAt = DateTime.UtcNow;
                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Payment {PaymentId} created successfully", payment.PaymentId);
                return payment;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating payment");
                throw;
            }
        }

        public async Task<PaymentModel> UpdatePaymentAsync(PaymentModel payment)
        {
            try
            {
                _context.Payments.Update(payment);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Payment {PaymentId} updated successfully", payment.PaymentId);
                return payment;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating payment {PaymentId}", payment.PaymentId);
                throw;
            }
        }

        public async Task<bool> DeletePaymentAsync(int paymentId)
        {
            try
            {
                var payment = await _context.Payments.FindAsync(paymentId);
                if (payment == null)
                    return false;

                _context.Payments.Remove(payment);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Payment {PaymentId} deleted successfully", paymentId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting payment {PaymentId}", paymentId);
                throw;
            }
        }
    }
}

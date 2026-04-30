using Billing_Backend.Models;
using Billing_Backend.Enums;
using Microsoft.EntityFrameworkCore;

namespace Billing_Backend.Data.Repositories
{
    public class InvoiceRepository : IInvoiceRepository
    {
        private readonly BillingDbContext _context;
        private readonly ILogger<InvoiceRepository> _logger;

        public InvoiceRepository(BillingDbContext context, ILogger<InvoiceRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<InvoiceModel?> GetInvoiceByIdAsync(int invoiceId)
        {
            try
            {
                return await _context.Invoices
                    .Include(i => i.Items)
                    .Include(i => i.Payments)
                    .FirstOrDefaultAsync(i => i.InvoiceId == invoiceId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving invoice with ID {InvoiceId}", invoiceId);
                throw;
            }
        }

        public async Task<InvoiceModel?> GetInvoiceByIdempotencyKeyAsync(string idempotencyKey)
        {
            try
            {
                return await _context.Invoices
                    .Include(i => i.Items)
                    .Include(i => i.Payments)
                    .FirstOrDefaultAsync(i => i.IdempotencyKey == idempotencyKey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving invoice with idempotency key {IdempotencyKey}", idempotencyKey);
                throw;
            }
        }

        public async Task<List<InvoiceModel>> GetPatientInvoicesAsync(int patientId)
        {
            try
            {
                return await _context.Invoices
                    .Where(i => i.PatientId == patientId)
                    .Include(i => i.Items)
                    .Include(i => i.Payments)
                    .OrderByDescending(i => i.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving invoices for patient {PatientId}", patientId);
                throw;
            }
        }

        public async Task<List<InvoiceModel>> GetPatientInvoicesByExternalIdAsync(string patientExternalId)
        {
            try
            {
                return await _context.Invoices
                    .Where(i => i.PatientExternalId == patientExternalId)
                    .Include(i => i.Items)
                    .Include(i => i.Payments)
                    .OrderByDescending(i => i.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving invoices for external patient {PatientExternalId}", patientExternalId);
                throw;
            }
        }

        public async Task<List<InvoiceModel>> GetInvoicesByStatusAsync(InvoiceStatus status)
        {
            try
            {
                return await _context.Invoices
                    .Where(i => i.Status == status)
                    .Include(i => i.Items)
                    .Include(i => i.Payments)
                    .OrderByDescending(i => i.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving invoices with status {Status}", status);
                throw;
            }
        }

        public async Task<List<InvoiceModel>> GetInvoicesByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                return await _context.Invoices
                    .Where(i => i.CreatedAt >= startDate && i.CreatedAt <= endDate)
                    .Include(i => i.Items)
                    .Include(i => i.Payments)
                    .OrderByDescending(i => i.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving invoices for date range {StartDate} to {EndDate}", startDate, endDate);
                throw;
            }
        }

        public async Task<InvoiceModel> CreateInvoiceAsync(InvoiceModel invoice)
        {
            try
            {
                invoice.CreatedAt = DateTime.UtcNow;
                invoice.UpdatedAt = DateTime.UtcNow;

                _context.Invoices.Add(invoice);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Invoice {InvoiceId} created successfully", invoice.InvoiceId);
                return invoice;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating invoice");
                throw;
            }
        }

        public async Task<InvoiceModel> UpdateInvoiceAsync(InvoiceModel invoice)
        {
            try
            {
                invoice.UpdatedAt = DateTime.UtcNow;
                _context.Invoices.Update(invoice);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Invoice {InvoiceId} updated successfully", invoice.InvoiceId);
                return invoice;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating invoice {InvoiceId}", invoice.InvoiceId);
                throw;
            }
        }

        public async Task<bool> DeleteInvoiceAsync(int invoiceId)
        {
            try
            {
                var invoice = await _context.Invoices.FindAsync(invoiceId);
                if (invoice == null)
                    return false;

                _context.Invoices.Remove(invoice);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Invoice {InvoiceId} deleted successfully", invoiceId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting invoice {InvoiceId}", invoiceId);
                throw;
            }
        }

        public async Task<bool> InvoiceExistsAsync(int invoiceId)
        {
            return await _context.Invoices.AnyAsync(i => i.InvoiceId == invoiceId);
        }
    }
}

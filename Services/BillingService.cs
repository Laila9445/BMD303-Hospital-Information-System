using Billing_Backend.Data.DTOs;
using Billing_Backend.Data.Repositories;
using Billing_Backend.Enums;
using Billing_Backend.Models;
using AutoMapper;

namespace Billing_Backend.Services
{
    public class BillingService : IBillingService
    {
        private readonly IInvoiceRepository _invoiceRepository;
        private readonly IPaymentRepository _paymentRepository;
        private readonly IMapper _mapper;
        private readonly ILogger<BillingService> _logger;

        public BillingService(
            IInvoiceRepository invoiceRepository,
            IPaymentRepository paymentRepository,
            IMapper mapper,
            ILogger<BillingService> logger)
        {
            _invoiceRepository = invoiceRepository;
            _paymentRepository = paymentRepository;
            _mapper = mapper;
            _logger = logger;
        }

        /// <summary>
        /// Process service event from other systems and create/update invoice
        /// </summary>
        public async Task<InvoiceDto> ProcessServiceEventAsync(ServiceEventDto eventDto)
        {
            try
            {
                // Validate event
                if (eventDto == null)
                    throw new ArgumentNullException(nameof(eventDto));

                if (eventDto.PatientId == null && string.IsNullOrEmpty(eventDto.PatientExternalId))
                    throw new InvalidOperationException("Either PatientId or PatientExternalId must be provided");

                if (string.IsNullOrEmpty(eventDto.ServiceName))
                    throw new ArgumentException("ServiceName is required");

                if (eventDto.Price < 0)
                    throw new ArgumentException("Price cannot be negative");

                // Handle idempotency - check if event already processed
                if (!string.IsNullOrEmpty(eventDto.IdempotencyKey))
                {
                    var existingInvoice = await _invoiceRepository.GetInvoiceByIdempotencyKeyAsync(eventDto.IdempotencyKey);
                    if (existingInvoice != null)
                    {
                        _logger.LogInformation("Duplicate event detected with idempotency key {IdempotencyKey}. Returning existing invoice.", eventDto.IdempotencyKey);
                        return _mapper.Map<InvoiceDto>(existingInvoice);
                    }
                }

                // Get or create invoice for patient
                InvoiceModel invoice;
                
                if (eventDto.PatientId.HasValue)
                {
                    var patientInvoices = await _invoiceRepository.GetPatientInvoicesAsync(eventDto.PatientId.Value);
                    invoice = patientInvoices.FirstOrDefault(i => i.Status == InvoiceStatus.Pending);
                }
                else
                {
                    var patientInvoices = await _invoiceRepository.GetPatientInvoicesByExternalIdAsync(eventDto.PatientExternalId!);
                    invoice = patientInvoices.FirstOrDefault(i => i.Status == InvoiceStatus.Pending);
                }

                // Create new invoice if none exists
                if (invoice == null)
                {
                    invoice = new InvoiceModel
                    {
                        PatientId = eventDto.PatientId,
                        PatientExternalId = eventDto.PatientExternalId,
                        Status = InvoiceStatus.Pending,
                        TotalAmount = 0,
                        PaidAmount = 0,
                        SourceSystem = eventDto.SourceSystem,
                        IdempotencyKey = eventDto.IdempotencyKey,
                        Items = new List<InvoiceItemModel>()
                    };

                    invoice = await _invoiceRepository.CreateInvoiceAsync(invoice);
                    _logger.LogInformation("New invoice created with ID {InvoiceId} for patient {PatientId}/{PatientExternalId}", 
                        invoice.InvoiceId, eventDto.PatientId, eventDto.PatientExternalId);
                }

               
                var invoiceItem = new InvoiceItemModel
                {
                    InvoiceId = invoice.InvoiceId,
                    ServiceName = eventDto.ServiceName,
                    Description = eventDto.Description,
                    Price = eventDto.Price,
                    Quantity = eventDto.Quantity,
                    ReferenceId = eventDto.ReferenceId,
                    ReferenceType = eventDto.ReferenceType,
                    CreatedAt = DateTime.UtcNow
                };

                if (invoice.Items == null)
                    invoice.Items = new List<InvoiceItemModel>();

                invoice.Items.Add(invoiceItem);

                // Update total amount
                invoice.TotalAmount += (eventDto.Price * eventDto.Quantity);
                invoice.UpdatedAt = DateTime.UtcNow;

                // Update invoice
                invoice = await _invoiceRepository.UpdateInvoiceAsync(invoice);

                _logger.LogInformation("Service event processed successfully. Invoice {InvoiceId} updated with item {ServiceName} (${Price})", 
                    invoice.InvoiceId, eventDto.ServiceName, eventDto.Price);

                return _mapper.Map<InvoiceDto>(invoice);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing service event");
                throw;
            }
        }

        public async Task<InvoiceDto?> GetInvoiceAsync(int invoiceId)
        {
            try
            {
                var invoice = await _invoiceRepository.GetInvoiceByIdAsync(invoiceId);
                return _mapper.Map<InvoiceDto?>(invoice);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving invoice {InvoiceId}", invoiceId);
                throw;
            }
        }

        public async Task<List<InvoiceDto>> GetPatientInvoicesAsync(int patientId)
        {
            try
            {
                var invoices = await _invoiceRepository.GetPatientInvoicesAsync(patientId);
                return _mapper.Map<List<InvoiceDto>>(invoices);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving invoices for patient {PatientId}", patientId);
                throw;
            }
        }

        public async Task<List<InvoiceDto>> GetPatientInvoicesByExternalIdAsync(string patientExternalId)
        {
            try
            {
                var invoices = await _invoiceRepository.GetPatientInvoicesByExternalIdAsync(patientExternalId);
                return _mapper.Map<List<InvoiceDto>>(invoices);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving invoices for external patient {PatientExternalId}", patientExternalId);
                throw;
            }
        }

        public async Task<List<InvoiceDto>> GetInvoicesByStatusAsync(InvoiceStatus status)
        {
            try
            {
                var invoices = await _invoiceRepository.GetInvoicesByStatusAsync(status);
                return _mapper.Map<List<InvoiceDto>>(invoices);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving invoices with status {Status}", status);
                throw;
            }
        }

        /// <summary>
        /// Process payment for an invoice and update invoice status
        /// </summary>
        public async Task<PaymentDto> ProcessPaymentAsync(CreatePaymentDto paymentDto)
        {
            try
            {
                // Validate
                if (paymentDto == null)
                    throw new ArgumentNullException(nameof(paymentDto));

                if (paymentDto.Amount <= 0)
                    throw new ArgumentException("Payment amount must be greater than zero");

                // Get invoice
                var invoice = await _invoiceRepository.GetInvoiceByIdAsync(paymentDto.InvoiceId);
                if (invoice == null)
                    throw new KeyNotFoundException($"Invoice {paymentDto.InvoiceId} not found");

                // Check if payment amount exceeds remaining balance
                var remainingAmount = invoice.TotalAmount - invoice.PaidAmount;
                if (paymentDto.Amount > remainingAmount)
                    throw new InvalidOperationException($"Payment amount (${paymentDto.Amount}) exceeds outstanding balance (${remainingAmount})");

                // Create payment
                var payment = new PaymentModel
                {
                    InvoiceId = paymentDto.InvoiceId,
                    Amount = paymentDto.Amount,
                    PaymentMethod = paymentDto.PaymentMethod,
                    TransactionId = paymentDto.TransactionId,
                    Status = PaymentStatus.Completed,
                    PaidAt = DateTime.UtcNow,
                    Notes = paymentDto.Notes,
                    ReferenceNumber = GenerateReferenceNumber()
                };

                payment = await _paymentRepository.CreatePaymentAsync(payment);

                // Update invoice
                invoice.PaidAmount += paymentDto.Amount;
                
                // Update status based on payment
                if (invoice.PaidAmount >= invoice.TotalAmount)
                {
                    invoice.Status = InvoiceStatus.Paid;
                    invoice.PaidAt = DateTime.UtcNow;
                }
                else if (invoice.PaidAmount > 0)
                {
                    invoice.Status = InvoiceStatus.Partial;
                }

                await _invoiceRepository.UpdateInvoiceAsync(invoice);

                _logger.LogInformation("Payment {PaymentId} processed successfully. Invoice {InvoiceId} status: {Status}", 
                    payment.PaymentId, invoice.InvoiceId, invoice.Status);

                return _mapper.Map<PaymentDto>(payment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing payment");
                throw;
            }
        }

        public async Task<List<PaymentDto>> GetInvoicePaymentsAsync(int invoiceId)
        {
            try
            {
                var payments = await _paymentRepository.GetInvoicePaymentsAsync(invoiceId);
                return _mapper.Map<List<PaymentDto>>(payments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving payments for invoice {InvoiceId}", invoiceId);
                throw;
            }
        }

        public async Task<InvoiceSummaryDto> GetInvoiceSummaryAsync()
        {
            try
            {
                var invoices = await _invoiceRepository.GetInvoicesByStatusAsync(InvoiceStatus.Pending);
                var paidInvoices = await _invoiceRepository.GetInvoicesByStatusAsync(InvoiceStatus.Paid);
                var partialInvoices = await _invoiceRepository.GetInvoicesByStatusAsync(InvoiceStatus.Partial);

                var totalInvoices = invoices.Count + paidInvoices.Count + partialInvoices.Count;
                var totalAmount = (invoices.Sum(i => i.TotalAmount) + 
                                  paidInvoices.Sum(i => i.TotalAmount) + 
                                  partialInvoices.Sum(i => i.TotalAmount));
                var paidAmount = (paidInvoices.Sum(i => i.TotalAmount) + 
                                 partialInvoices.Sum(i => i.PaidAmount));
                var pendingAmount = invoices.Sum(i => i.TotalAmount) + 
                                   partialInvoices.Sum(i => i.TotalAmount - i.PaidAmount);

                return new InvoiceSummaryDto
                {
                    TotalInvoices = totalInvoices,
                    PaidInvoices = paidInvoices.Count,
                    PendingInvoices = invoices.Count,
                    PartialInvoices = partialInvoices.Count,
                    TotalAmount = totalAmount,
                    PaidAmount = paidAmount,
                    PendingAmount = pendingAmount
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving invoice summary");
                throw;
            }
        }

        public async Task<PatientInvoiceSummaryDto> GetPatientInvoiceSummaryAsync(int patientId)
        {
            try
            {
                var invoices = await _invoiceRepository.GetPatientInvoicesAsync(patientId);
                return BuildPatientSummary(patientId, null, invoices);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving invoice summary for patient {PatientId}", patientId);
                throw;
            }
        }

        public async Task<PatientInvoiceSummaryDto> GetPatientInvoiceSummaryByExternalIdAsync(string patientExternalId)
        {
            try
            {
                var invoices = await _invoiceRepository.GetPatientInvoicesByExternalIdAsync(patientExternalId);
                return BuildPatientSummary(null, patientExternalId, invoices);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving invoice summary for external patient {PatientExternalId}", patientExternalId);
                throw;
            }
        }

        // Private helpers

        private PatientInvoiceSummaryDto BuildPatientSummary(int? patientId, string? patientExternalId, List<InvoiceModel> invoices)
        {
            var totalAmount = invoices.Sum(i => i.TotalAmount);
            var paidAmount = invoices.Sum(i => i.PaidAmount);
            var outstandingAmount = totalAmount - paidAmount;

            var overallStatus = invoices.Any(i => i.Status == InvoiceStatus.Pending) 
                ? InvoiceStatus.Pending 
                : InvoiceStatus.Paid;

            return new PatientInvoiceSummaryDto
            {
                PatientId = patientId,
                PatientExternalId = patientExternalId,
                TotalInvoices = invoices.Count,
                TotalAmount = totalAmount,
                PaidAmount = paidAmount,
                OutstandingAmount = outstandingAmount,
                OverallStatus = overallStatus,
                RecentInvoices = _mapper.Map<List<InvoiceDto>>(invoices.Take(5).ToList())
            };
        }

        private string GenerateReferenceNumber()
        {
            return $"PAY-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
        }
    }
}

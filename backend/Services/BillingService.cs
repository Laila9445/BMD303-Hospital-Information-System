using CLINICSYSTEM.Data;
using CLINICSYSTEM.Data.DTOs;
using CLINICSYSTEM.Exceptions;
using CLINICSYSTEM.Helpers;
using CLINICSYSTEM.Models;
using Microsoft.EntityFrameworkCore;

namespace CLINICSYSTEM.Services
{
    public class BillingService : IBillingService
    {
        private readonly ClinicDbContext _context;

        private static readonly string[] AllowedPaymentMethods = { "Cash", "InstaPay", "Card" };
        private static readonly string[] CancellableInvoiceTypes = { "Referral", "Radiology Referral", "Physiotherapy Referral" };

        public BillingService(ClinicDbContext context)
        {
            _context = context;
        }

        public async Task<List<BillingServiceDTO>> GetAllServicesAsync()
        {
            var services = await _context.BillingServices.OrderBy(s => s.Id).ToListAsync();
            return services.Select(ToServiceDto).ToList();
        }

        public async Task<BillingServiceDTO> CreateServiceAsync(CreateBillingServiceRequest request)
        {
            var service = new Models.BillingService
            {
                Id = BillingHelpers.NextServiceId(_context),
                ServiceName = request.ServiceName,
                Department = request.Department,
                Price = request.Price,
                Description = request.Description,
                Status = string.IsNullOrWhiteSpace(request.Status) ? "Active" : request.Status,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.BillingServices.Add(service);
            await _context.SaveChangesAsync();
            return ToServiceDto(service);
        }

        public async Task<BillingServiceDTO> UpdateServiceAsync(string id, UpdateBillingServiceRequest request)
        {
            var service = await _context.BillingServices.FindAsync(id)
                ?? throw new NotFoundException($"Service with ID {id} not found.");

            if (!string.IsNullOrWhiteSpace(request.ServiceName)) service.ServiceName = request.ServiceName;
            if (!string.IsNullOrWhiteSpace(request.Department)) service.Department = request.Department;
            if (request.Price.HasValue) service.Price = request.Price.Value;
            if (request.Description != null) service.Description = request.Description;
            if (!string.IsNullOrWhiteSpace(request.Status)) service.Status = request.Status;
            service.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return ToServiceDto(service);
        }

        public async Task<BillingServiceDTO> ToggleServiceAsync(string id)
        {
            var service = await _context.BillingServices.FindAsync(id)
                ?? throw new NotFoundException($"Service with ID {id} not found.");

            service.Status = service.Status == "Active" ? "Inactive" : "Active";
            service.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return ToServiceDto(service);
        }

        public async Task<List<BillingInvoiceDTO>> GetInvoicesAsync(int? userId, string? role)
        {
            var query = _context.BillingInvoices.AsQueryable();

            if (role == "Patient" && userId.HasValue)
            {
                var variants = GetPatientIdVariants(userId.Value);
                query = query.Where(i => variants.Contains(i.PatientId));
            }

            var invoices = await query.OrderByDescending(i => i.CreatedAt).ToListAsync();
            return invoices.Select(ToInvoiceDto).ToList();
        }

        public async Task<BillingInvoiceDTO?> GetInvoiceByIdAsync(string id)
        {
            var invoice = await _context.BillingInvoices.FindAsync(id);
            return invoice == null ? null : ToInvoiceDto(invoice);
        }

        public async Task<BillingInvoiceDTO> CreateInvoiceAsync(CreateBillingInvoiceRequest request)
        {
            var amount = request.Amount ?? request.FinalAmount ?? request.Price;
            var finalAmount = request.FinalAmount ?? amount;
            var type = request.Type ?? InferInvoiceType(request.Department);
            var status = string.IsNullOrWhiteSpace(request.Status) ? "Pending" : request.Status;
            var date = request.Date ?? DateTime.UtcNow.Date;

            var invoice = new BillingInvoice
            {
                Id = BillingHelpers.NextInvoiceId(_context),
                PatientId = request.PatientId,
                PatientName = request.PatientName,
                Department = request.Department,
                ServiceId = request.ServiceId,
                ServiceName = request.ServiceName,
                Type = type,
                Status = status,
                Date = date,
                Amount = amount,
                Price = request.Price,
                TotalPaid = 0,
                RemainingAmount = finalAmount,
                InsuranceId = request.InsuranceId,
                InsuranceName = request.InsuranceName,
                InsuranceCoverage = request.InsuranceCoverage,
                InsuranceDiscount = request.InsuranceDiscount,
                FinalAmount = request.FinalAmount,
                ReferenceType = request.ReferenceType,
                ReferenceId = request.ReferenceId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.BillingInvoices.Add(invoice);
            await _context.SaveChangesAsync();

            await ApplyReferenceSideEffectsAsync(invoice, "Payment Pending");
            return ToInvoiceDto(invoice);
        }

        public async Task<BillingInvoiceDTO> UpdateInvoiceStatusAsync(string id, UpdateBillingInvoiceStatusRequest request)
        {
            var invoice = await _context.BillingInvoices.FindAsync(id)
                ?? throw new NotFoundException($"Invoice with ID {id} not found.");

            invoice.Status = request.Status;
            invoice.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return ToInvoiceDto(invoice);
        }

        public async Task<BillingInvoiceDTO> CancelInvoiceAsync(string id, CancelBillingInvoiceRequest request)
        {
            var invoice = await _context.BillingInvoices.FindAsync(id)
                ?? throw new NotFoundException($"Invoice with ID {id} not found.");

            if (!CancellableInvoiceTypes.Contains(invoice.Type))
            {
                throw new BusinessException("INVALID_INVOICE_TYPE", "Only referral invoices can be cancelled through this endpoint.");
            }

            if (invoice.Status != "Pending")
            {
                throw new BusinessException("INVALID_INVOICE_STATUS", "Only pending invoices can be cancelled.");
            }

            if (string.IsNullOrWhiteSpace(request.Reason))
            {
                throw new BusinessException("CANCELLATION_REASON_REQUIRED", "Cancellation reason is required.");
            }

            invoice.Status = "Cancelled";
            invoice.CancellationReason = request.Reason;
            invoice.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return ToInvoiceDto(invoice);
        }

        public async Task<List<BillingPaymentDTO>> GetPaymentsAsync(int? userId, string? role)
        {
            var query = _context.BillingPayments.AsQueryable();

            if (role == "Patient" && userId.HasValue)
            {
                var variants = GetPatientIdVariants(userId.Value);
                query = query.Where(p => variants.Contains(p.PatientId));
            }

            var payments = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
            return payments.Select(ToPaymentDto).ToList();
        }

        public async Task<BillingPaymentResultDTO> RecordPaymentAsync(RecordBillingPaymentRequest request)
        {
            if (!AllowedPaymentMethods.Contains(request.Method))
            {
                throw new BusinessException("INVALID_PAYMENT_METHOD", "Payment method must be Cash, InstaPay, or Card.");
            }

            if (request.Amount <= 0)
            {
                throw new BusinessException("INVALID_PAYMENT_AMOUNT", "Payment amount must be greater than zero.");
            }

            var invoice = await _context.BillingInvoices.FindAsync(request.InvoiceId)
                ?? throw new NotFoundException($"Invoice with ID {request.InvoiceId} not found.");

            if (invoice.Status != "Pending")
            {
                throw new BusinessException("INVALID_INVOICE_STATUS", "Only pending invoices can receive payments.");
            }

            if (request.Amount > invoice.RemainingAmount)
            {
                throw new BusinessException("PAYMENT_EXCEEDS_REMAINING", "Payment amount exceeds remaining invoice balance.");
            }

            var payment = new BillingPayment
            {
                Id = BillingHelpers.NextPaymentId(_context),
                InvoiceId = invoice.Id,
                PatientId = request.PatientId,
                PatientName = request.PatientName,
                Amount = request.Amount,
                Method = request.Method,
                Date = DateTime.UtcNow.Date,
                CreatedAt = DateTime.UtcNow
            };

            _context.BillingPayments.Add(payment);

            invoice.TotalPaid += request.Amount;
            invoice.RemainingAmount -= request.Amount;
            invoice.UpdatedAt = DateTime.UtcNow;

            if (invoice.RemainingAmount <= 0)
            {
                invoice.Status = "Paid";
                invoice.RemainingAmount = 0;
                await ApplyPaidReferenceSideEffectsAsync(invoice);
            }

            await _context.SaveChangesAsync();

            return new BillingPaymentResultDTO
            {
                Payment = ToPaymentDto(payment),
                Invoice = ToInvoiceDto(invoice)
            };
        }

        private async Task ApplyReferenceSideEffectsAsync(BillingInvoice invoice, string targetStatus)
        {
            if (string.IsNullOrWhiteSpace(invoice.ReferenceType) || string.IsNullOrWhiteSpace(invoice.ReferenceId))
            {
                return;
            }

            if (invoice.ReferenceType == "Appointment" && int.TryParse(invoice.ReferenceId, out var appointmentId))
            {
                var appointment = await _context.Appointments.FindAsync(appointmentId);
                if (appointment != null)
                {
                    appointment.Status = targetStatus;
                    appointment.UpdatedAt = DateTime.UtcNow;
                }
            }
            else if (invoice.ReferenceType == "Referral" && int.TryParse(invoice.ReferenceId, out var referralId))
            {
                var referral = await _context.Referrals.FindAsync(referralId);
                if (referral != null)
                {
                    referral.Status = targetStatus;
                    referral.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();
        }

        private async Task ApplyPaidReferenceSideEffectsAsync(BillingInvoice invoice)
        {
            if (string.IsNullOrWhiteSpace(invoice.ReferenceType) || string.IsNullOrWhiteSpace(invoice.ReferenceId))
            {
                return;
            }

            if (invoice.ReferenceType == "Appointment" && int.TryParse(invoice.ReferenceId, out var appointmentId))
            {
                var appointment = await _context.Appointments.FindAsync(appointmentId);
                if (appointment != null)
                {
                    appointment.Status = "Confirmed";
                    appointment.UpdatedAt = DateTime.UtcNow;
                }
            }
            else if (invoice.ReferenceType == "Referral" && int.TryParse(invoice.ReferenceId, out var referralId))
            {
                var referral = await _context.Referrals.FindAsync(referralId);
                if (referral != null)
                {
                    referral.Status = "Paid";
                    referral.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();
        }

        private static string InferInvoiceType(string department) => department switch
        {
            "Radiology" => "Radiology Referral",
            "Physiotherapy" => "Physiotherapy Referral",
            "Doctor" => "Consultation",
            _ => "Referral"
        };

        private static List<string> GetPatientIdVariants(int userId) =>
            new()
            {
                userId.ToString(),
                $"PAT-{userId}",
                $"PAT-{1000 + userId}"
            };

        private static BillingServiceDTO ToServiceDto(Models.BillingService service) => new()
        {
            Id = service.Id,
            ServiceName = service.ServiceName,
            Department = service.Department,
            Price = service.Price,
            Description = service.Description,
            Status = service.Status,
            CreatedAt = service.CreatedAt,
            UpdatedAt = service.UpdatedAt
        };

        private static BillingInvoiceDTO ToInvoiceDto(BillingInvoice invoice) => new()
        {
            Id = invoice.Id,
            PatientId = invoice.PatientId,
            PatientName = invoice.PatientName,
            Department = invoice.Department,
            ServiceId = invoice.ServiceId,
            ServiceName = invoice.ServiceName,
            Type = invoice.Type,
            Status = invoice.Status,
            Date = invoice.Date,
            Amount = invoice.Amount,
            Price = invoice.Price,
            TotalPaid = invoice.TotalPaid,
            RemainingAmount = invoice.RemainingAmount,
            InsuranceId = invoice.InsuranceId,
            InsuranceName = invoice.InsuranceName,
            InsuranceCoverage = invoice.InsuranceCoverage,
            InsuranceDiscount = invoice.InsuranceDiscount,
            FinalAmount = invoice.FinalAmount,
            CancellationReason = invoice.CancellationReason,
            ReferenceType = invoice.ReferenceType,
            ReferenceId = invoice.ReferenceId,
            CreatedAt = invoice.CreatedAt,
            UpdatedAt = invoice.UpdatedAt
        };

        private static BillingPaymentDTO ToPaymentDto(BillingPayment payment) => new()
        {
            Id = payment.Id,
            InvoiceId = payment.InvoiceId,
            PatientId = payment.PatientId,
            PatientName = payment.PatientName,
            Amount = payment.Amount,
            Method = payment.Method,
            Date = payment.Date,
            CreatedAt = payment.CreatedAt
        };
    }
}

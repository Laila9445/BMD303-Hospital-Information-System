using Billing_Backend.Services;
using Billing_Backend.Data.DTOs;
using Billing_Backend.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Billing_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BillingController : ControllerBase
    {
        private readonly IBillingService _billingService;
        private readonly ILogger<BillingController> _logger;

        public BillingController(IBillingService billingService, ILogger<BillingController> logger)
        {
            _billingService = billingService;
            _logger = logger;
        }

        [HttpPost("events")]
        [AllowAnonymous]
        public async Task<ActionResult<InvoiceDto>> ProcessServiceEvent([FromBody] ServiceEventDto eventDto)
        {
            try
            {
                _logger.LogInformation("Processing service event for patient {PatientId}/{PatientExternalId}", 
                    eventDto.PatientId, eventDto.PatientExternalId);

                var result = await _billingService.ProcessServiceEventAsync(eventDto);
                return Ok(new { success = true, data = result });
            }
            catch (ArgumentNullException ex)
            {
                _logger.LogWarning(ex, "Invalid service event received");
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid service event data");
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing service event");
                return StatusCode(500, new { success = false, message = "Error processing service event" });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<InvoiceDto>> GetInvoice(int id)
        {
            try
            {
                var invoice = await _billingService.GetInvoiceAsync(id);
                if (invoice == null)
                    return NotFound(new { success = false, message = "Invoice not found" });

                return Ok(new { success = true, data = invoice });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving invoice {InvoiceId}", id);
                return StatusCode(500, new { success = false, message = "Error retrieving invoice" });
            }
        }

    
        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<List<InvoiceDto>>> GetPatientInvoices(int patientId)
        {
            try
            {
                var invoices = await _billingService.GetPatientInvoicesAsync(patientId);
                return Ok(new { success = true, data = invoices });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving invoices for patient {PatientId}", patientId);
                return StatusCode(500, new { success = false, message = "Error retrieving invoices" });
            }
        }

     
        [HttpGet("external-patient/{patientExternalId}")]
        public async Task<ActionResult<List<InvoiceDto>>> GetPatientInvoicesByExternalId(string patientExternalId)
        {
            try
            {
                var invoices = await _billingService.GetPatientInvoicesByExternalIdAsync(patientExternalId);
                return Ok(new { success = true, data = invoices });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving invoices for external patient {PatientExternalId}", patientExternalId);
                return StatusCode(500, new { success = false, message = "Error retrieving invoices" });
            }
        }

        /// <summary>
        /// Get invoices by status
        /// </summary>
        [HttpGet("status/{status}")]
        public async Task<ActionResult<List<InvoiceDto>>> GetInvoicesByStatus(InvoiceStatus status)
        {
            try
            {
                var invoices = await _billingService.GetInvoicesByStatusAsync(status);
                return Ok(new { success = true, data = invoices });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving invoices with status {Status}", status);
                return StatusCode(500, new { success = false, message = "Error retrieving invoices" });
            }
        }

     
        [HttpPost("payments")]
        public async Task<ActionResult<PaymentDto>> ProcessPayment([FromBody] CreatePaymentDto paymentDto)
        {
            try
            {
                _logger.LogInformation("Processing payment for invoice {InvoiceId}", paymentDto.InvoiceId);

                var payment = await _billingService.ProcessPaymentAsync(paymentDto);
                return Ok(new { success = true, data = payment });
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing payment");
                return StatusCode(500, new { success = false, message = "Error processing payment" });
            }
        }

      
        [HttpGet("{invoiceId}/payments")]
        public async Task<ActionResult<List<PaymentDto>>> GetInvoicePayments(int invoiceId)
        {
            try
            {
                var payments = await _billingService.GetInvoicePaymentsAsync(invoiceId);
                return Ok(new { success = true, data = payments });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving payments for invoice {InvoiceId}", invoiceId);
                return StatusCode(500, new { success = false, message = "Error retrieving payments" });
            }
        }

        [HttpGet("summary/system")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<InvoiceSummaryDto>> GetInvoiceSummary()
        {
            try
            {
                var summary = await _billingService.GetInvoiceSummaryAsync();
                return Ok(new { success = true, data = summary });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving invoice summary");
                return StatusCode(500, new { success = false, message = "Error retrieving summary" });
            }
        }

        [HttpGet("summary/patient/{patientId}")]
        public async Task<ActionResult<PatientInvoiceSummaryDto>> GetPatientSummary(int patientId)
        {
            try
            {
                var summary = await _billingService.GetPatientInvoiceSummaryAsync(patientId);
                return Ok(new { success = true, data = summary });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving patient summary for {PatientId}", patientId);
                return StatusCode(500, new { success = false, message = "Error retrieving summary" });
            }
        }


        [HttpGet("summary/external-patient/{patientExternalId}")]
        public async Task<ActionResult<PatientInvoiceSummaryDto>> GetPatientSummaryByExternalId(string patientExternalId)
        {
            try
            {
                var summary = await _billingService.GetPatientInvoiceSummaryByExternalIdAsync(patientExternalId);
                return Ok(new { success = true, data = summary });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving patient summary for external ID {PatientExternalId}", patientExternalId);
                return StatusCode(500, new { success = false, message = "Error retrieving summary" });
            }
        }
    }
}

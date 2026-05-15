using CLINICSYSTEM.Data.DTOs;
using CLINICSYSTEM.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CLINICSYSTEM.Controllers
{
    [ApiController]
    [Route("api/billing")]
    [Authorize]
    public class BillingController : ControllerBase
    {
        private readonly IBillingService _billingService;

        public BillingController(IBillingService billingService)
        {
            _billingService = billingService;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null && int.TryParse(claim.Value, out var id) ? id : 0;
        }

        private string? GetUserRole() => User.FindFirst(ClaimTypes.Role)?.Value;

        [HttpGet("services")]
        public async Task<IActionResult> GetServices()
        {
            var services = await _billingService.GetAllServicesAsync();
            return Ok(ApiResponse.Ok(services));
        }

        [HttpPost("services")]
        [Authorize(Roles = "Nurse")]
        public async Task<IActionResult> CreateService([FromBody] CreateBillingServiceRequest request)
        {
            var service = await _billingService.CreateServiceAsync(request);
            return StatusCode(201, ApiResponse.Ok(service));
        }

        [HttpPatch("services/{id}")]
        [Authorize(Roles = "Nurse")]
        public async Task<IActionResult> UpdateService(string id, [FromBody] UpdateBillingServiceRequest request)
        {
            var service = await _billingService.UpdateServiceAsync(id, request);
            return Ok(ApiResponse.Ok(service));
        }

        [HttpPatch("services/{id}/toggle")]
        [Authorize(Roles = "Nurse")]
        public async Task<IActionResult> ToggleService(string id)
        {
            var service = await _billingService.ToggleServiceAsync(id);
            return Ok(ApiResponse.Ok(service));
        }

        [HttpGet("invoices")]
        public async Task<IActionResult> GetInvoices()
        {
            var userId = GetUserId();
            var role = GetUserRole();
            var invoices = await _billingService.GetInvoicesAsync(userId == 0 ? null : userId, role);
            return Ok(ApiResponse.Ok(invoices));
        }

        [HttpGet("invoices/{id}")]
        public async Task<IActionResult> GetInvoice(string id)
        {
            var invoice = await _billingService.GetInvoiceByIdAsync(id);
            if (invoice == null)
            {
                return NotFound(ApiResponse.Fail("Invoice not found"));
            }

            return Ok(ApiResponse.Ok(invoice));
        }

        [HttpPost("invoices")]
        [Authorize(Roles = "Nurse,Radiologist,Physiotherapist")]
        public async Task<IActionResult> CreateInvoice([FromBody] CreateBillingInvoiceRequest request)
        {
            var invoice = await _billingService.CreateInvoiceAsync(request);
            return StatusCode(201, ApiResponse.Ok(invoice));
        }

        [HttpPatch("invoices/{id}")]
        [Authorize(Roles = "Nurse")]
        public async Task<IActionResult> UpdateInvoiceStatus(string id, [FromBody] UpdateBillingInvoiceStatusRequest request)
        {
            var invoice = await _billingService.UpdateInvoiceStatusAsync(id, request);
            return Ok(ApiResponse.Ok(invoice));
        }

        [HttpPatch("invoices/{id}/cancel")]
        [Authorize(Roles = "Nurse")]
        public async Task<IActionResult> CancelInvoice(string id, [FromBody] CancelBillingInvoiceRequest request)
        {
            var invoice = await _billingService.CancelInvoiceAsync(id, request);
            return Ok(ApiResponse.Ok(invoice));
        }

        [HttpGet("payments")]
        public async Task<IActionResult> GetPayments()
        {
            var userId = GetUserId();
            var role = GetUserRole();
            var payments = await _billingService.GetPaymentsAsync(userId == 0 ? null : userId, role);
            return Ok(ApiResponse.Ok(payments));
        }

        [HttpPost("payments")]
        [Authorize(Roles = "Nurse")]
        public async Task<IActionResult> RecordPayment([FromBody] RecordBillingPaymentRequest request)
        {
            var result = await _billingService.RecordPaymentAsync(request);
            return Ok(ApiResponse.Ok(result));
        }
    }
}

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CLINICSYSTEM.Data.DTOs;
using CLINICSYSTEM.Services;

namespace CLINICSYSTEM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PrescriptionsController : ControllerBase
    {
        private readonly IPrescriptionService _prescriptionService;

        public PrescriptionsController(IPrescriptionService prescriptionService)
        {
            _prescriptionService = prescriptionService;
        }

        [Authorize(Roles = "Doctor")]
        [HttpPost]
        public async Task<IActionResult> CreatePrescription([FromBody] CreatePrescriptionRequest request)
        {
            var prescription = await _prescriptionService.CreatePrescriptionAsync(request);
            if (prescription == null) return BadRequest("Failed to create prescription");

            return Ok(prescription);
        }

        [Authorize(Roles = "Doctor")]
        [HttpPost("bulk")]
        public async Task<IActionResult> CreateBulkPrescriptions([FromBody] BulkPrescriptionRequest request)
        {
            var prescriptions = await _prescriptionService.CreateBulkPrescriptionsAsync(request);
            return Ok(prescriptions);
        }

        [Authorize(Roles = "Patient")]
        [HttpGet("my-prescriptions")]
        public async Task<IActionResult> GetMyPrescriptions()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized();

            var prescriptions = await _prescriptionService.GetPatientPrescriptionsAsync(userId);
            return Ok(prescriptions);
        }

        [HttpGet("{prescriptionId}")]
        public async Task<IActionResult> GetPrescriptionDetails([FromRoute] int prescriptionId)
        {
            var prescription = await _prescriptionService.GetPrescriptionDetailsAsync(prescriptionId);
            if (prescription == null) return NotFound();

            return Ok(prescription);
        }

        [HttpGet("{prescriptionId}/pdf")]
        public async Task<IActionResult> GeneratePrescriptionPdf([FromRoute] int prescriptionId)
        {
            var pdfBytes = await _prescriptionService.GeneratePrescriptionPdfAsync(prescriptionId);
            if (pdfBytes == null) return NotFound();

            return File(pdfBytes, "application/pdf", $"prescription_{prescriptionId}.pdf");
        }

        [Authorize(Roles = "Doctor")]
        [HttpPost("{prescriptionId}/send")]
        public async Task<IActionResult> SendPrescriptionToPatient([FromRoute] int prescriptionId)
        {
            var result = await _prescriptionService.SendPrescriptionToPatientAsync(prescriptionId);
            if (!result) return BadRequest("Failed to send prescription");

            return Ok(new { message = "Prescription sent to patient" });
        }
    }
}

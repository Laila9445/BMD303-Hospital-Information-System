using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CLINICSYSTEM.Data.DTOs;
using CLINICSYSTEM.Services;

namespace CLINICSYSTEM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Doctor")]
    public class ConsultationsController : ControllerBase
    {
        private readonly IConsultationService _consultationService;

        public ConsultationsController(IConsultationService consultationService)
        {
            _consultationService = consultationService;
        }

        // ============================================
        // DOCTOR: Start consultation
        // ============================================
        [HttpPost("start")]
        public async Task<IActionResult> StartConsultation([FromBody] StartConsultationRequest request)
        {
            var consultation = await _consultationService.StartConsultationAsync(request.AppointmentId);
            if (consultation == null) return BadRequest("Failed to start consultation");

            return Ok(consultation);
        }

        // ============================================
        // DOCTOR: Update consultation
        // ============================================
        [HttpPut("{consultationId}")]
        public async Task<IActionResult> UpdateConsultation(
            [FromRoute] int consultationId,
            [FromBody] UpdateConsultationRequest request)
        {
            var result = await _consultationService.UpdateConsultationAsync(consultationId, request);
            if (!result) return BadRequest("Failed to update consultation");

            return Ok(new { message = "Consultation updated successfully" });
        }

        // ============================================
        // DOCTOR: End consultation
        // ============================================
        [HttpPut("{consultationId}/end")]
        public async Task<IActionResult> EndConsultation([FromRoute] int consultationId)
        {
            var result = await _consultationService.EndConsultationAsync(consultationId);
            if (!result) return BadRequest("Failed to end consultation");

            return Ok(new { message = "Consultation ended successfully" });
        }

        // ============================================
        // DOCTOR: Get consultation details
        // ============================================
        [HttpGet("{consultationId}")]
        public async Task<IActionResult> GetConsultationDetails([FromRoute] int consultationId)
        {
            var consultation = await _consultationService.GetConsultationDetailsAsync(consultationId);
            if (consultation == null) return NotFound();

            return Ok(consultation);
        }

        // ============================================
        // PATIENT: Own consultation history
        // ============================================
        [Authorize(Roles = "Patient")]
        [HttpGet("patient/history")]
        public async Task<IActionResult> GetPatientConsultationHistory()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
                return Unauthorized();

            var history = await _consultationService.GetPatientConsultationHistoryAsync(userId);
            return Ok(history);
        }

        // ============================================
        // DOCTOR: View any patient's consultation history (NEW)
        // ============================================
        [Authorize(Roles = "Doctor")]
        [HttpGet("doctor/patient-history/{patientId}")]
        public async Task<IActionResult> GetPatientConsultationHistoryForDoctor([FromRoute] int patientId)
        {
            var history = await _consultationService.GetPatientConsultationHistoryAsync(patientId);
            return Ok(history);
        }
    }
}
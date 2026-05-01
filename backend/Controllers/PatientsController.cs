using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using CLINICSYSTEM.Data.DTOs;
using CLINICSYSTEM.Services;

namespace CLINICSYSTEM.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Patient")]
    public class PatientsController : ControllerBase
    {
        private readonly IPatientPortalService _patientService;

        public PatientsController(IPatientPortalService patientService)
        {
            _patientService = patientService;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null && int.TryParse(claim.Value, out var id) ? id : 0;
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var profile = await _patientService.GetPatientProfileAsync(userId);
            if (profile == null) return NotFound();

            return Ok(profile);
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdatePatientProfileRequest request)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var result = await _patientService.UpdatePatientProfileAsync(userId, request);
            if (!result) return BadRequest(new { message = "Failed to update profile" });

            return Ok(new { message = "Profile updated successfully" });
        }

        [HttpGet("medical-history")]
        public async Task<IActionResult> GetMedicalHistory()
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var history = await _patientService.GetMedicalHistoryAsync(userId);
            return Ok(history);
        }

        [HttpPut("medical-history")]
        public async Task<IActionResult> UpdateMedicalHistory([FromBody] UpdateMedicalHistoryRequest request)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var result = await _patientService.UpdateMedicalHistoryAsync(userId, request);
            if (!result) return BadRequest(new { message = "Failed to update medical history" });

            return Ok(new { message = "Medical history updated" });
        }

        [HttpGet("appointments")]
        public async Task<IActionResult> GetAppointments()
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var appointments = await _patientService.GetPatientAppointmentsAsync(userId);
            return Ok(appointments);
        }

        [HttpGet("prescriptions")]
        public async Task<IActionResult> GetPrescriptions()
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var prescriptions = await _patientService.GetPatientPrescriptionsAsync(userId);
            return Ok(prescriptions);
        }

        [HttpPost("medical-images/upload")]
        public async Task<IActionResult> UploadMedicalImage([FromForm] UploadMedicalImageRequest request)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var image = await _patientService.UploadMedicalImageAsync(userId, request);
            if (image == null) return BadRequest(new { message = "Failed to upload image" });

            return Ok(image);
        }

        [HttpGet("medical-images")]
        public async Task<IActionResult> ListMedicalImages()
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var images = await _patientService.GetMedicalImagesAsync(userId);
            return Ok(images);
        }
    }
}

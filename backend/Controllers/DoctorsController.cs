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
    public class DoctorsController : ControllerBase
    {
        private readonly IDoctorService _doctorService;
        private readonly ILogger<DoctorsController> _logger;

        public DoctorsController(IDoctorService doctorService, ILogger<DoctorsController> logger)
        {
            _doctorService = doctorService;
            _logger = logger;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return (userIdClaim != null && int.TryParse(userIdClaim.Value, out var id)) ? id : 0;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllDoctors()
        {
            try
            {
                var doctors = await _doctorService.GetAllDoctorsAsync();
                return Ok(doctors);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all doctors");
                return StatusCode(500, new { message = "An error occurred while retrieving doctors" });
            }
        }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var userId = GetUserId();
                if (userId == 0) return Unauthorized();

                var profile = await _doctorService.GetProfileAsync(userId);
                if (profile == null)
                    return NotFound(new { message = "Doctor profile not found" });

                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving doctor profile");
                return StatusCode(500, new { message = "An error occurred while retrieving profile" });
            }
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateDoctorProfileRequest request)
        {
            try
            {
                var userId = GetUserId();
                if (userId == 0) return Unauthorized();

                var result = await _doctorService.UpdateProfileAsync(userId, request);
                if (!result)
                    return BadRequest(new { message = "Failed to update profile" });

                return Ok(new { message = "Profile updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating doctor profile");
                return StatusCode(500, new { message = "An error occurred while updating profile" });
            }
        }

        [HttpGet("appointments/today")]
        public async Task<IActionResult> GetTodayAppointments()
        {
            try
            {
                var userId = GetUserId();
                if (userId == 0) return Unauthorized();

                var doctorId = await _doctorService.GetDoctorIdByUserIdAsync(userId);
                if (doctorId == null)
                    return NotFound(new { message = "Doctor profile not found" });

                var appointments = await _doctorService.GetTodayAppointmentsAsync(doctorId.Value);

                // FIX: ensure NOT null type mismatch
                return Ok(appointments ?? new List<DayAppointmentDTO>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving today's appointments");
                return StatusCode(500, new { message = "An error occurred while retrieving appointments" });
            }
        }

        [HttpGet("appointments")]
        public async Task<IActionResult> GetAppointments([FromQuery] DateTime date)
        {
            try
            {
                var userId = GetUserId();
                if (userId == 0) return Unauthorized();

                var doctorId = await _doctorService.GetDoctorIdByUserIdAsync(userId);
                if (doctorId == null)
                    return NotFound(new { message = "Doctor profile not found" });

                if (date == DateTime.MinValue)
                    date = DateTime.UtcNow.Date;

                var appointments = await _doctorService.GetAppointmentsAsync(doctorId.Value, date);

                return Ok(appointments ?? new List<DayAppointmentDTO>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving appointments");
                return StatusCode(500, new { message = "An error occurred while retrieving appointments" });
            }
        }

        [HttpGet("patients/{patientId}")]
        public async Task<IActionResult> GetPatientRecord([FromRoute] int patientId)
        {
            try
            {
                var record = await _doctorService.GetPatientRecordAsync(patientId);
                if (record == null)
                    return NotFound(new { message = "Patient record not found" });

                return Ok(record);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving patient record");
                return StatusCode(500, new { message = "An error occurred while retrieving patient record" });
            }
        }

        [HttpGet("patients/search")]
        public async Task<IActionResult> SearchPatients([FromQuery] string query)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(query))
                    return BadRequest(new { message = "Search query is required" });

                var patients = await _doctorService.SearchPatientsAsync(query);
                return Ok(patients);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching patients");
                return StatusCode(500, new { message = "An error occurred while searching patients" });
            }
        }

        [HttpGet("patients/{patientId}/images")]
        public async Task<IActionResult> GetPatientMedicalImages([FromRoute] int patientId)
        {
            try
            {
                var images = await _doctorService.GetPatientMedicalImagesAsync(patientId);
                return Ok(images);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving patient medical images");
                return StatusCode(500, new { message = "An error occurred while retrieving images" });
            }
        }

        [HttpPost("schedule")]
        public async Task<IActionResult> CreateSchedule([FromBody] CreateScheduleRequest request)
        {
            try
            {
                var userId = GetUserId();
                if (userId == 0) return Unauthorized();

                var doctorId = await _doctorService.GetDoctorIdByUserIdAsync(userId);
                if (doctorId == null)
                    return NotFound(new { message = "Doctor profile not found" });

                var result = await _doctorService.CreateScheduleAsync(doctorId.Value, request);
                if (!result)
                    return BadRequest(new { message = "Failed to create schedule" });

                return Ok(new { message = "Schedule created successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating schedule");
                return StatusCode(500, new { message = "An error occurred while creating schedule" });
            }
        }

        [HttpGet("schedule")]
        public async Task<IActionResult> GetSchedules()
        {
            try
            {
                var userId = GetUserId();
                if (userId == 0) return Unauthorized();

                var doctorId = await _doctorService.GetDoctorIdByUserIdAsync(userId);
                if (doctorId == null)
                    return NotFound(new { message = "Doctor profile not found" });

                var schedules = await _doctorService.GetSchedulesAsync(doctorId.Value);

                return Ok(schedules ?? new List<DoctorScheduleDTO>());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving schedules");
                return StatusCode(500, new { message = "An error occurred while retrieving schedules" });
            }
        }

        [HttpDelete("schedule/{scheduleId}")]
        public async Task<IActionResult> DeleteSchedule([FromRoute] int scheduleId)
        {
            try
            {
                var result = await _doctorService.DeleteScheduleAsync(scheduleId);
                if (!result)
                    return NotFound(new { message = "Schedule not found" });

                return Ok(new { message = "Schedule deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting schedule");
                return StatusCode(500, new { message = "An error occurred while deleting schedule" });
            }
        }
    }
}
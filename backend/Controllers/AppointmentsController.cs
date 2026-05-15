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
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;

        public AppointmentsController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null && int.TryParse(userIdClaim.Value, out var id) ? id : 0;
        }

        [HttpGet("available-slots")]
        public async Task<IActionResult> GetAvailableSlots(
            [FromQuery] int doctorId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            if (startDate == DateTime.MinValue) startDate = DateTime.UtcNow.Date;
            if (endDate == DateTime.MinValue) endDate = startDate.AddDays(30);

            var slots = await _appointmentService.GetAvailableSlotsAsync(doctorId, startDate, endDate);
            return Ok(slots);
        }

        [Authorize(Roles = "Patient,Doctor,Physiotherapist,Radiologist")]
        [HttpPost("book")]
        public async Task<IActionResult> BookAppointment([FromBody] BookAppointmentRequest request)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var appointment = await _appointmentService.BookAppointmentAsync(userId, request);
            if (appointment == null) 
                return BadRequest(new { success = false, error = "Cannot book appointment. The selected time slot is either unavailable, in the past, or the referral is invalid." });

            return Ok(new { success = true, data = appointment });
        }

        [Authorize(Roles = "Patient")]
        [HttpPut("reschedule")]
        public async Task<IActionResult> RescheduleAppointment([FromBody] RescheduleAppointmentRequest request)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var result = await _appointmentService.RescheduleAppointmentAsync(userId, request);
            if (!result) return BadRequest(new { error = "Cannot reschedule appointment. The selected time slot is either unavailable, in the past, or the appointment was not found." });

            return Ok(new { message = "Appointment rescheduled successfully" });
        }

        [Authorize(Roles = "Patient,Doctor")]
        [HttpPut("cancel")]
        public async Task<IActionResult> CancelAppointment([FromBody] CancelAppointmentRequest request)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var result = await _appointmentService.CancelAppointmentAsync(userId, request);
            if (!result) return BadRequest("Failed to cancel appointment");

            return Ok(new { message = "Appointment cancelled successfully" });
        }

        [Authorize(Roles = "Patient")]
        [HttpGet("my-appointments")]
        public async Task<IActionResult> GetMyAppointments()
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var appointments = await _appointmentService.GetPatientAppointmentsAsync(userId);
            return Ok(appointments);
        }

        [HttpGet("{appointmentId}")]
        public async Task<IActionResult> GetAppointmentDetails([FromRoute] int appointmentId)
        {
            var appointment = await _appointmentService.GetAppointmentDetailsAsync(appointmentId);
            if (appointment == null) return NotFound();

            return Ok(appointment);
        }

        [Authorize(Roles = "Doctor")]
        [HttpGet("doctor-appointments")]
        public async Task<IActionResult> GetDoctorAppointments(
            [FromQuery] DateTime? date = null)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var appointments = await _appointmentService.GetDoctorAppointmentsAsync(userId, date);
            return Ok(appointments);
        }

        [Authorize(Roles = "Doctor")]
        [HttpPost("create")]
        public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentRequest request)
        {
            var userId = GetUserId();
            if (userId == 0) return Unauthorized();

            var appointment = await _appointmentService.CreateAppointmentAsync(userId, request);
            if (appointment == null) 
                return BadRequest(new { error = "Failed to create appointment. The selected time slot may be unavailable." });

            return Ok(appointment);
        }
    }
}

using CLINICSYSTEM.Data;
using CLINICSYSTEM.Data.DTOs;
using CLINICSYSTEM.Models;
using CLINICSYSTEM.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CLINICSYSTEM.Controllers
{
    [ApiController]
    [Route("api/Physio")]
    [Authorize(Roles = "Physiotherapist")]
    public class PhysioController : ControllerBase
    {
        private readonly ClinicDbContext _context;
        private readonly IReferralService _referralService;

        public PhysioController(ClinicDbContext context, IReferralService referralService)
        {
            _context = context;
            _referralService = referralService;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null && int.TryParse(claim.Value, out var id) ? id : 0;
        }

        [HttpGet("referrals")]
        public async Task<IActionResult> GetReferrals([FromQuery] string? status = null)
        {
            var referrals = await _referralService.GetMyReferralsAsync(GetUserId(), "Physiotherapist", status);
            return Ok(ApiResponse.Ok(referrals));
        }

        [HttpGet("patients")]
        public async Task<IActionResult> GetPatients()
        {
            var patients = await (
                from p in _context.Patients
                join u in _context.Users on p.UserId equals u.Id
                orderby p.FullName
                select new
                {
                    patientId = p.PatientId,
                    userId = u.Id,
                    firstName = u.FirstName,
                    lastName = u.LastName,
                    fullName = p.FullName,
                    email = u.Email,
                    phoneNumber = p.PhoneNumber ?? u.PhoneNumber,
                    externalPatientId = p.ExternalPatientId,
                    dateOfBirth = p.DateOfBirth,
                    gender = p.Gender,
                    address = p.Address
                }).ToListAsync();

            return Ok(ApiResponse.Ok(patients));
        }

        [HttpGet("patients/{patientId}")]
        public async Task<IActionResult> GetPatient(int patientId)
        {
            var patient = await _context.Users.FindAsync(patientId);
            if (patient == null) return NotFound(ApiResponse.Fail("Patient not found"));

            var referrals = await _referralService.GetPatientReferralsAsync($"PAT-{patientId}");
            var plans = await _context.PhysioTreatmentPlans
                .Where(p => p.PatientId == patientId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(ApiResponse.Ok(new
            {
                userId = patient.Id,
                firstName = patient.FirstName,
                lastName = patient.LastName,
                email = patient.Email,
                phoneNumber = patient.PhoneNumber,
                referrals,
                treatmentPlans = plans.Select(MapPlan)
            }));
        }

        [HttpGet("appointments")]
        public async Task<IActionResult> GetAppointments()
        {
            var userId = GetUserId();
            var referralIds = await _context.Referrals
                .Where(r => r.AssignedToRole == "Physiotherapist")
                .Select(r => r.ReferralId)
                .ToListAsync();

            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
            var appointments = await _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d!.User)
                .Include(a => a.TimeSlot)
                .Include(a => a.Patient)
                .Where(a => (doctor != null && a.DoctorId == doctor.DoctorId) ||
                            (a.ReferralId.HasValue && referralIds.Contains(a.ReferralId.Value)))
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return Ok(ApiResponse.Ok(appointments.Select(MapAppointment).ToList()));
        }

        [HttpGet("treatment-plans")]
        public async Task<IActionResult> GetTreatmentPlans()
        {
            var plans = await _context.PhysioTreatmentPlans
                .Include(p => p.Patient)
                .Include(p => p.Physio)
                .Where(p => p.PhysioId == GetUserId())
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return Ok(ApiResponse.Ok(plans.Select(MapPlan).ToList()));
        }

        [HttpPost("treatment-plans")]
        public async Task<IActionResult> CreateTreatmentPlan([FromBody] CreatePhysioTreatmentPlanRequest request)
        {
            var plan = new PhysioTreatmentPlan
            {
                PatientId = request.PatientId,
                PhysioId = GetUserId(),
                ReferralId = request.ReferralId,
                Title = request.Title,
                Description = request.Description,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Sessions = request.Sessions ?? 0,
                Notes = request.Notes,
                Status = "Active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.PhysioTreatmentPlans.Add(plan);
            await _context.SaveChangesAsync();
            await _context.Entry(plan).Reference(p => p.Patient).LoadAsync();
            await _context.Entry(plan).Reference(p => p.Physio).LoadAsync();

            return StatusCode(201, ApiResponse.Ok(MapPlan(plan)));
        }

        [HttpPut("treatment-plans/{id}")]
        public async Task<IActionResult> UpdateTreatmentPlan(int id, [FromBody] UpdatePhysioTreatmentPlanRequest request)
        {
            var plan = await _context.PhysioTreatmentPlans.FirstOrDefaultAsync(p => p.Id == id && p.PhysioId == GetUserId());
            if (plan == null) return NotFound(ApiResponse.Fail("Treatment plan not found"));

            if (!string.IsNullOrWhiteSpace(request.Title)) plan.Title = request.Title;
            if (request.Description != null) plan.Description = request.Description;
            if (request.StartDate.HasValue) plan.StartDate = request.StartDate;
            if (request.EndDate.HasValue) plan.EndDate = request.EndDate;
            if (!string.IsNullOrWhiteSpace(request.Status)) plan.Status = request.Status;
            if (request.Sessions.HasValue) plan.Sessions = request.Sessions.Value;
            if (request.CompletedSessions.HasValue) plan.CompletedSessions = request.CompletedSessions.Value;
            if (request.Notes != null) plan.Notes = request.Notes;
            plan.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await _context.Entry(plan).Reference(p => p.Patient).LoadAsync();
            await _context.Entry(plan).Reference(p => p.Physio).LoadAsync();
            return Ok(ApiResponse.Ok(MapPlan(plan)));
        }

        [HttpGet("treatment-plans/{id}")]
        public async Task<IActionResult> GetTreatmentPlan(int id)
        {
            var plan = await _context.PhysioTreatmentPlans
                .Include(p => p.Patient)
                .Include(p => p.Physio)
                .FirstOrDefaultAsync(p => p.Id == id && p.PhysioId == GetUserId());

            if (plan == null) return NotFound(ApiResponse.Fail("Treatment plan not found"));
            return Ok(ApiResponse.Ok(MapPlan(plan)));
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var userId = GetUserId();
            var patientIds = await _context.Referrals
                .Where(r => r.AssignedToRole == "Physiotherapist")
                .Select(r => r.PatientId)
                .Distinct()
                .CountAsync();

            var pendingReferrals = await _context.Referrals
                .CountAsync(r => r.AssignedToRole == "Physiotherapist" && r.Status == "Pending");

            var today = DateTime.UtcNow.Date;
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
            var todaysAppointments = doctor == null
                ? 0
                : await _context.Appointments
                    .Include(a => a.TimeSlot)
                    .CountAsync(a => a.DoctorId == doctor.DoctorId && a.TimeSlot!.SlotDate.Date == today);

            var activePlans = await _context.PhysioTreatmentPlans
                .CountAsync(p => p.PhysioId == userId && p.Status == "Active");

            return Ok(ApiResponse.Ok(new
            {
                totalPatients = patientIds,
                pendingReferrals,
                todaysAppointments,
                activeTreatmentPlans = activePlans
            }));
        }

        [HttpGet("staff")]
        public async Task<IActionResult> GetStaff()
        {
            var staff = await _context.Users
                .Where(u => u.Role == "Physiotherapist")
                .Select(u => new { userId = u.Id, firstName = u.FirstName, lastName = u.LastName, email = u.Email })
                .ToListAsync();

            return Ok(ApiResponse.Ok(staff));
        }

        private static object MapPlan(PhysioTreatmentPlan plan) => new
        {
            id = plan.Id,
            patientId = plan.PatientId,
            patientName = plan.Patient != null ? $"{plan.Patient.FirstName} {plan.Patient.LastName}" : string.Empty,
            physioId = plan.PhysioId,
            physioName = plan.Physio != null ? $"{plan.Physio.FirstName} {plan.Physio.LastName}" : string.Empty,
            referralId = plan.ReferralId,
            title = plan.Title,
            description = plan.Description,
            startDate = plan.StartDate,
            endDate = plan.EndDate,
            status = plan.Status,
            sessions = plan.Sessions,
            completedSessions = plan.CompletedSessions,
            notes = plan.Notes,
            createdAt = plan.CreatedAt,
            updatedAt = plan.UpdatedAt
        };

        private static object MapAppointment(AppointmentModel a) => new
        {
            appointmentId = a.AppointmentId,
            doctorName = a.Doctor?.User != null ? $"{a.Doctor.User.FirstName} {a.Doctor.User.LastName}" : string.Empty,
            patientName = a.Patient?.FullName ?? string.Empty,
            appointmentDate = a.TimeSlot?.SlotDate,
            startTime = a.TimeSlot?.StartTime,
            endTime = a.TimeSlot?.EndTime,
            status = a.Status,
            reasonForVisit = a.ReasonForVisit
        };
    }

    public class CreatePhysioTreatmentPlanRequest
    {
        public int PatientId { get; set; }
        public int? ReferralId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? Sessions { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdatePhysioTreatmentPlanRequest
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Status { get; set; }
        public int? Sessions { get; set; }
        public int? CompletedSessions { get; set; }
        public string? Notes { get; set; }
    }
}

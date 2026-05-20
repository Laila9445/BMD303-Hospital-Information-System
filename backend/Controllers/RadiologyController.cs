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
    [Route("api/Radiology")]
    [Authorize(Roles = "Radiologist")]
    public class RadiologyController : ControllerBase
    {
        private readonly ClinicDbContext _context;
        private readonly IReferralService _referralService;
        private readonly IBillingService _billingService;

        public RadiologyController(ClinicDbContext context, IReferralService referralService, IBillingService billingService)
        {
            _context = context;
            _referralService = referralService;
            _billingService = billingService;
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            return claim != null && int.TryParse(claim.Value, out var id) ? id : 0;
        }

        [HttpGet("referrals")]
        public async Task<IActionResult> GetReferrals([FromQuery] string? status = null)
        {
            var referrals = await _referralService.GetMyReferralsAsync(GetUserId(), "Radiologist", status);
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
            var studies = await _context.RadiologyStudies.Where(s => s.PatientId == patientId).ToListAsync();
            var reports = await _context.RadiologyReports.Where(r => r.PatientId == patientId).ToListAsync();

            return Ok(ApiResponse.Ok(new
            {
                userId = patient.Id,
                firstName = patient.FirstName,
                lastName = patient.LastName,
                referrals,
                studies = studies.Select(MapStudy),
                reports = reports.Select(MapReport)
            }));
        }

        [HttpGet("studies")]
        public async Task<IActionResult> GetStudies()
        {
            var studies = await _context.RadiologyStudies
                .Include(s => s.Patient)
                .Include(s => s.Radiologist)
                .Where(s => s.RadiologistId == GetUserId())
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            return Ok(ApiResponse.Ok(studies.Select(MapStudy).ToList()));
        }

        [HttpPost("studies")]
        public async Task<IActionResult> CreateStudy([FromBody] CreateRadiologyStudyRequest request)
        {
            var study = new RadiologyStudy
            {
                PatientId = request.PatientId,
                RadiologistId = GetUserId(),
                ReferralId = request.ReferralId,
                StudyType = request.StudyType,
                StudyDate = request.StudyDate,
                Notes = request.Notes,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.RadiologyStudies.Add(study);
            await _context.SaveChangesAsync();
            await _context.Entry(study).Reference(s => s.Patient).LoadAsync();
            await _context.Entry(study).Reference(s => s.Radiologist).LoadAsync();

            return StatusCode(201, ApiResponse.Ok(MapStudy(study)));
        }

        [HttpPut("studies/{id}")]
        public async Task<IActionResult> UpdateStudy(int id, [FromBody] UpdateRadiologyStudyRequest request)
        {
            var study = await _context.RadiologyStudies
                .Include(s => s.Patient)
                .FirstOrDefaultAsync(s => s.Id == id && s.RadiologistId == GetUserId());

            if (study == null) return NotFound(ApiResponse.Fail("Study not found"));

            if (!string.IsNullOrWhiteSpace(request.StudyType)) study.StudyType = request.StudyType;
            if (!string.IsNullOrWhiteSpace(request.Status)) study.Status = request.Status;
            if (request.StudyDate.HasValue) study.StudyDate = request.StudyDate;
            if (request.Notes != null) study.Notes = request.Notes;
            study.UpdatedAt = DateTime.UtcNow;

            if (request.Status == "Completed" && !study.BillingCreated)
            {
                var service = await _context.BillingServices
                    .Where(s => s.Department == "Radiology" && s.Status == "Active")
                    .OrderBy(s => s.Id)
                    .FirstOrDefaultAsync();

                if (service != null && study.Patient != null)
                {
                    var invoice = await _billingService.CreateInvoiceAsync(new CreateBillingInvoiceRequest
                    {
                        PatientId = $"RAD-{study.Id}",
                        PatientName = $"{study.Patient.FirstName} {study.Patient.LastName}",
                        Department = "Radiology",
                        ServiceId = service.Id,
                        ServiceName = service.ServiceName,
                        Price = service.Price
                    });

                    study.BillingCreated = true;
                    study.BillingInvoiceId = invoice.Id;
                }
            }

            await _context.SaveChangesAsync();
            await _context.Entry(study).Reference(s => s.Radiologist).LoadAsync();
            return Ok(ApiResponse.Ok(MapStudy(study)));
        }

        [HttpGet("studies/{id}")]
        public async Task<IActionResult> GetStudy(int id)
        {
            var study = await _context.RadiologyStudies
                .Include(s => s.Patient)
                .Include(s => s.Radiologist)
                .FirstOrDefaultAsync(s => s.Id == id && s.RadiologistId == GetUserId());

            if (study == null) return NotFound(ApiResponse.Fail("Study not found"));
            return Ok(ApiResponse.Ok(MapStudy(study)));
        }

        [HttpGet("reports")]
        public async Task<IActionResult> GetReports()
        {
            var reports = await _context.RadiologyReports
                .Where(r => r.RadiologistId == GetUserId())
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(ApiResponse.Ok(reports.Select(MapReport).ToList()));
        }

        [HttpPost("reports")]
        public async Task<IActionResult> CreateReport([FromBody] CreateRadiologyReportRequest request)
        {
            var study = await _context.RadiologyStudies.FindAsync(request.StudyId);
            if (study == null) return NotFound(ApiResponse.Fail("Study not found"));

            var report = new RadiologyReport
            {
                StudyId = request.StudyId,
                RadiologistId = GetUserId(),
                PatientId = study.PatientId,
                Findings = request.Findings,
                Impression = request.Impression,
                Recommendations = request.Recommendations,
                Status = "Draft",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.RadiologyReports.Add(report);
            await _context.SaveChangesAsync();
            return StatusCode(201, ApiResponse.Ok(MapReport(report)));
        }

        [HttpPut("reports/{id}")]
        public async Task<IActionResult> UpdateReport(int id, [FromBody] UpdateRadiologyReportRequest request)
        {
            var report = await _context.RadiologyReports.FirstOrDefaultAsync(r => r.Id == id && r.RadiologistId == GetUserId());
            if (report == null) return NotFound(ApiResponse.Fail("Report not found"));

            if (request.Findings != null) report.Findings = request.Findings;
            if (request.Impression != null) report.Impression = request.Impression;
            if (request.Recommendations != null) report.Recommendations = request.Recommendations;
            if (!string.IsNullOrWhiteSpace(request.Status)) report.Status = request.Status;
            report.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(ApiResponse.Ok(MapReport(report)));
        }

        [HttpGet("reports/{id}")]
        public async Task<IActionResult> GetReport(int id)
        {
            var report = await _context.RadiologyReports
                .Include(r => r.Study)
                .Include(r => r.Patient)
                .FirstOrDefaultAsync(r => r.Id == id && r.RadiologistId == GetUserId());

            if (report == null) return NotFound(ApiResponse.Fail("Report not found"));
            return Ok(ApiResponse.Ok(MapReport(report)));
        }

        [HttpGet("appointments")]
        public async Task<IActionResult> GetAppointments()
        {
            var userId = GetUserId();
            var referralIds = await _context.Referrals
                .Where(r => r.AssignedToRole == "Radiologist")
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

            return Ok(ApiResponse.Ok(appointments.Select(a => new
            {
                appointmentId = a.AppointmentId,
                doctorName = a.Doctor?.User != null ? $"{a.Doctor.User.FirstName} {a.Doctor.User.LastName}" : string.Empty,
                patientName = a.Patient?.FullName ?? string.Empty,
                appointmentDate = a.TimeSlot?.SlotDate,
                startTime = a.TimeSlot?.StartTime,
                endTime = a.TimeSlot?.EndTime,
                status = a.Status
            }).ToList()));
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var userId = GetUserId();
            var totalStudies = await _context.RadiologyStudies.CountAsync(s => s.RadiologistId == userId);
            var pendingReferrals = await _context.Referrals.CountAsync(r => r.AssignedToRole == "Radiologist" && r.Status == "Pending");
            var today = DateTime.UtcNow.Date;
            var doctor = await _context.Doctors.FirstOrDefaultAsync(d => d.UserId == userId);
            var todaysAppointments = doctor == null ? 0 : await _context.Appointments
                .Include(a => a.TimeSlot)
                .CountAsync(a => a.DoctorId == doctor.DoctorId && a.TimeSlot!.SlotDate.Date == today);
            var completedReports = await _context.RadiologyReports.CountAsync(r => r.RadiologistId == userId && r.Status == "Final");

            return Ok(ApiResponse.Ok(new
            {
                totalStudies,
                pendingReferrals,
                todaysAppointments,
                completedReports
            }));
        }

        [HttpGet("staff")]
        public async Task<IActionResult> GetStaff()
        {
            var staff = await _context.UserRoles
                .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => new { ur.UserId, r.Name })
                .Join(_context.Users, x => x.UserId, u => u.Id, (x, u) => new { u, x.Name })
                .Where(x => x.Name == "Radiologist")
                .Select(x => new { userId = x.u.Id, firstName = x.u.FirstName, lastName = x.u.LastName, email = x.u.Email })
                .ToListAsync();

            return Ok(ApiResponse.Ok(staff));
        }

        private static object MapStudy(RadiologyStudy study) => new
        {
            id = study.Id,
            patientId = study.PatientId,
            patientName = study.Patient != null ? $"{study.Patient.FirstName} {study.Patient.LastName}" : string.Empty,
            radiologistId = study.RadiologistId,
            radiologistName = study.Radiologist != null ? $"{study.Radiologist.FirstName} {study.Radiologist.LastName}" : string.Empty,
            referralId = study.ReferralId,
            studyType = study.StudyType,
            status = study.Status,
            studyDate = study.StudyDate,
            notes = study.Notes,
            billingCreated = study.BillingCreated,
            billingInvoiceId = study.BillingInvoiceId,
            createdAt = study.CreatedAt,
            updatedAt = study.UpdatedAt
        };

        private static object MapReport(RadiologyReport report) => new
        {
            id = report.Id,
            studyId = report.StudyId,
            radiologistId = report.RadiologistId,
            patientId = report.PatientId,
            findings = report.Findings,
            impression = report.Impression,
            recommendations = report.Recommendations,
            status = report.Status,
            createdAt = report.CreatedAt,
            updatedAt = report.UpdatedAt
        };
    }

    public class CreateRadiologyStudyRequest
    {
        public int PatientId { get; set; }
        public int? ReferralId { get; set; }
        public string StudyType { get; set; } = string.Empty;
        public DateTime? StudyDate { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateRadiologyStudyRequest
    {
        public string? StudyType { get; set; }
        public string? Status { get; set; }
        public DateTime? StudyDate { get; set; }
        public string? Notes { get; set; }
    }

    public class CreateRadiologyReportRequest
    {
        public int StudyId { get; set; }
        public string? Findings { get; set; }
        public string? Impression { get; set; }
        public string? Recommendations { get; set; }
    }

    public class UpdateRadiologyReportRequest
    {
        public string? Findings { get; set; }
        public string? Impression { get; set; }
        public string? Recommendations { get; set; }
        public string? Status { get; set; }
    }
}

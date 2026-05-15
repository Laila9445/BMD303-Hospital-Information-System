using CLINICSYSTEM.Data;
using CLINICSYSTEM.Data.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CLINICSYSTEM.Controllers
{
    [ApiController]
    [Route("api/Nurse")]
    [Authorize(Roles = "Nurse")]
    public class NurseController : ControllerBase
    {
        private readonly ClinicDbContext _context;

        public NurseController(ClinicDbContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var today = DateTime.UtcNow.Date;
            var todaysAppointments = await _context.Appointments
                .Include(a => a.TimeSlot)
                .CountAsync(a => a.TimeSlot != null && a.TimeSlot.SlotDate.Date == today);

            var totalPatients = await _context.UserRoles
                .Join(_context.Roles, ur => ur.RoleId, r => r.Id, (ur, r) => new { ur, r.Name })
                .CountAsync(x => x.Name == "Patient");

            var pendingReferrals = await _context.Referrals.CountAsync(r => r.Status == "Pending");
            var pendingInvoices = await _context.BillingInvoices.CountAsync(i => i.Status == "Pending");

            return Ok(ApiResponse.Ok(new
            {
                todaysAppointments,
                totalPatients,
                pendingReferrals,
                pendingInvoices
            }));
        }

        [HttpGet("appointments")]
        public async Task<IActionResult> GetAppointments()
        {
            var appointments = await _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d!.User)
                .Include(a => a.Patient)
                .Include(a => a.TimeSlot)
                .OrderByDescending(a => a.TimeSlot!.SlotDate)
                .ToListAsync();

            var data = appointments.Select(a => new
            {
                appointmentId = a.AppointmentId,
                doctorName = a.Doctor?.User != null ? $"{a.Doctor.User.FirstName} {a.Doctor.User.LastName}" : string.Empty,
                patientName = a.Patient?.FullName ?? string.Empty,
                appointmentDate = a.TimeSlot?.SlotDate,
                startTime = a.TimeSlot?.StartTime,
                endTime = a.TimeSlot?.EndTime,
                status = a.Status
            }).ToList();

            return Ok(ApiResponse.Ok(data));
        }

        [HttpGet("patients")]
        public async Task<IActionResult> GetPatients()
        {
            var patients = await (
                from u in _context.Users
                where u.Role == "Patient"
                join p in _context.Patients on u.Id equals p.UserId into patientJoin
                from p in patientJoin.DefaultIfEmpty()
                select new
                {
                    userId = u.Id,
                    firstName = u.FirstName,
                    lastName = u.LastName,
                    email = u.Email,
                    phoneNumber = p != null ? p.PhoneNumber : u.PhoneNumber,
                    dateOfBirth = p != null ? p.DateOfBirth : null,
                    gender = p != null ? p.Gender : null
                }).ToListAsync();

            return Ok(ApiResponse.Ok(patients));
        }

        [HttpGet("schedule")]
        public async Task<IActionResult> GetSchedule()
        {
            var schedules = await _context.DoctorSchedules
                .Include(s => s.Doctor)
                .ThenInclude(d => d!.User)
                .OrderBy(s => s.DayOfWeek)
                .ToListAsync();

            var data = schedules.Select(s => new
            {
                scheduleId = s.ScheduleId,
                doctorId = s.DoctorId,
                doctorName = s.Doctor?.User != null ? $"{s.Doctor.User.FirstName} {s.Doctor.User.LastName}" : string.Empty,
                dayOfWeek = s.DayOfWeek,
                startTime = s.StartTime,
                endTime = s.EndTime,
                slotDurationMinutes = s.SlotDurationMinutes,
                isActive = true
            }).ToList();

            return Ok(ApiResponse.Ok(data));
        }
    }
}

using Microsoft.EntityFrameworkCore;
using CLINICSYSTEM.Data;
using CLINICSYSTEM.Data.DTOs;
using CLINICSYSTEM.Models;

namespace CLINICSYSTEM.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly ClinicDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly IDateTimeProvider _dateTimeProvider;

        public AppointmentService(
            ClinicDbContext context,
            INotificationService notificationService,
            IDateTimeProvider dateTimeProvider)
        {
            _context = context;
            _notificationService = notificationService;
            _dateTimeProvider = dateTimeProvider;
        }

        // =========================
        // FIXED METHOD
        // =========================
        public async Task<List<TimeSlotDTO>> GetAvailableSlotsAsync(int doctorId, DateTime startDate, DateTime endDate)
        {
            var slots = await _context.TimeSlots
                .Include(ts => ts.Schedule)
                .Where(ts =>
                    ts.Schedule != null &&
                    ts.Schedule.DoctorId == doctorId &&
                    ts.SlotDate >= startDate &&
                    ts.SlotDate <= endDate &&
                    ts.Status == "Available")
                .Select(ts => new TimeSlotDTO
                {
                    TimeSlotId = ts.TimeSlotId,
                    SlotDate = ts.SlotDate,
                    StartTime = ts.StartTime,
                    EndTime = ts.EndTime,
                    Status = ts.Status
                })
                .ToListAsync();

            return slots
                .OrderBy(x => x.SlotDate)
                .ThenBy(x => x.StartTime)
                .ToList();
        }

        // =========================
        // CREATE APPOINTMENT (MISSING - FIXED)
        // =========================
        public async Task<bool> CreateAppointmentAsync(int patientId, CreateAppointmentRequest request)
        {
            var timeSlot = await _context.TimeSlots.FindAsync(request.TimeSlotId);

            if (timeSlot == null || timeSlot.Status != "Available")
                return false;

            var appointment = new AppointmentModel
            {
                
                PatientId = patientId,
                TimeSlotId = request.TimeSlotId,
                Status = "Scheduled",
                ReasonForVisit = request.ReasonForVisit,
                BookedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            timeSlot.Status = "Booked";

            _context.Appointments.Add(appointment);
            _context.TimeSlots.Update(timeSlot);
            await _context.SaveChangesAsync();

            return true;
        }

        // =========================
        // BOOK APPOINTMENT
        // =========================
        public async Task<AppointmentDTO?> BookAppointmentAsync(int patientId, BookAppointmentRequest request)
        {
            var timeSlot = await _context.TimeSlots.FindAsync(request.TimeSlotId);

            if (timeSlot == null || timeSlot.Status != "Available")
                return null;

            var appointmentDateTime = timeSlot.SlotDate.Add(timeSlot.StartTime);

            if (appointmentDateTime < _dateTimeProvider.UtcNow)
                return null;

            var appointment = new AppointmentModel
            {
            
                PatientId = patientId,
                TimeSlotId = request.TimeSlotId,
                Status = "Scheduled",
                ReasonForVisit = request.ReasonForVisit,
                BookedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            timeSlot.Status = "Booked";

            _context.Appointments.Add(appointment);
            _context.TimeSlots.Update(timeSlot);
            await _context.SaveChangesAsync();

            return await GetAppointmentDetailsAsync(appointment.AppointmentId);
        }

        // =========================
        // GET DOCTOR APPOINTMENTS (MISSING - FIXED)
        // =========================
        public async Task<List<AppointmentDTO>> GetDoctorAppointmentsAsync(int doctorId, DateTime? date)
        {
            var query = _context.Appointments
                .Include(a => a.Doctor)
                    .ThenInclude(d => d.User)
                .Include(a => a.TimeSlot)
                .Where(a => a.DoctorId == doctorId);

            if (date.HasValue)
            {
                query = query.Where(a => a.TimeSlot.SlotDate.Date == date.Value.Date);
            }

            var result = await query.ToListAsync();

            return result.Select(a => new AppointmentDTO
            {
                AppointmentId = a.AppointmentId,
                DoctorName = $"{a.Doctor.User.FirstName} {a.Doctor.User.LastName}",
                PatientName = "",
                AppointmentDate = a.TimeSlot.SlotDate,
                StartTime = a.TimeSlot.StartTime,
                EndTime = a.TimeSlot.EndTime,
                Status = a.Status,
                ReasonForVisit = a.ReasonForVisit
            }).ToList();
        }

        // =========================
        // RESCHEDULE
        // =========================
        public async Task<bool> RescheduleAppointmentAsync(int patientId, RescheduleAppointmentRequest request)
        {
            var appointment = await _context.Appointments
                .Include(a => a.TimeSlot)
                .FirstOrDefaultAsync(a =>
                    a.AppointmentId == request.AppointmentId &&
                    a.PatientId == patientId);

            if (appointment == null) return false;

            var newSlot = await _context.TimeSlots.FindAsync(request.NewTimeSlotId);

            if (newSlot == null || newSlot.Status != "Available")
                return false;

            if (appointment.TimeSlot != null)
                appointment.TimeSlot.Status = "Available";

            newSlot.Status = "Booked";
            appointment.TimeSlotId = request.NewTimeSlotId;
            appointment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        // =========================
        // CANCEL
        // =========================
        public async Task<bool> CancelAppointmentAsync(int patientId, CancelAppointmentRequest request)
        {
            var appointment = await _context.Appointments
                .Include(a => a.TimeSlot)
                .FirstOrDefaultAsync(a =>
                    a.AppointmentId == request.AppointmentId &&
                    a.PatientId == patientId);

            if (appointment == null) return false;

            appointment.Status = "Cancelled";
            appointment.CanceledAt = DateTime.UtcNow;

            if (appointment.TimeSlot != null)
                appointment.TimeSlot.Status = "Available";

            await _context.SaveChangesAsync();
            return true;
        }

        // =========================
        // GET PATIENT APPOINTMENTS
        // =========================
        public async Task<List<AppointmentDTO>> GetPatientAppointmentsAsync(int patientId)
        {
            var appointments = await _context.Appointments
                .Include(a => a.Doctor)
                    .ThenInclude(d => d.User)
                .Include(a => a.TimeSlot)
                .Where(a => a.PatientId == patientId)
                .ToListAsync();

            return appointments
                .OrderByDescending(a => a.TimeSlot.SlotDate)
                .Select(a => new AppointmentDTO
                {
                    AppointmentId = a.AppointmentId,
                    DoctorName = $"{a.Doctor.User.FirstName} {a.Doctor.User.LastName}",
                    PatientName = "",
                    AppointmentDate = a.TimeSlot.SlotDate,
                    StartTime = a.TimeSlot.StartTime,
                    EndTime = a.TimeSlot.EndTime,
                    Status = a.Status,
                    ReasonForVisit = a.ReasonForVisit
                })
                .ToList();
        }

        // =========================
        // GET APPOINTMENT DETAILS
        // =========================
        public async Task<AppointmentDTO?> GetAppointmentDetailsAsync(int appointmentId)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Doctor)
                    .ThenInclude(d => d.User)
                .Include(a => a.TimeSlot)
                .FirstOrDefaultAsync(a => a.AppointmentId == appointmentId);

            if (appointment == null) return null;

            return new AppointmentDTO
            {
                AppointmentId = appointment.AppointmentId,
                DoctorName = $"{appointment.Doctor.User.FirstName} {appointment.Doctor.User.LastName}",
                PatientName = "",
                AppointmentDate = appointment.TimeSlot.SlotDate,
                StartTime = appointment.TimeSlot.StartTime,
                EndTime = appointment.TimeSlot.EndTime,
                Status = appointment.Status,
                ReasonForVisit = appointment.ReasonForVisit
            };
        }
    }
}
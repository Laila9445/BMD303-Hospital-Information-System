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
        private readonly ICurrentUserService _currentUserService;

        public AppointmentService(
            ClinicDbContext context,
            INotificationService notificationService,
            IDateTimeProvider dateTimeProvider,
            ICurrentUserService currentUserService)
        {
            _context = context;
            _notificationService = notificationService;
            _dateTimeProvider = dateTimeProvider;
            _currentUserService = currentUserService;
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
        public async Task<AppointmentDTO?> BookAppointmentAsync(int userOrPatientId, BookAppointmentRequest request)
        {
            var timeSlot = await _context.TimeSlots
                .Include(ts => ts.Schedule)
                .FirstOrDefaultAsync(ts => ts.TimeSlotId == request.TimeSlotId);

            if (timeSlot == null || timeSlot.Status != "Available")
                return null;

            var appointmentDateTime = timeSlot.SlotDate.Add(timeSlot.StartTime);

            if (appointmentDateTime < _dateTimeProvider.UtcNow)
                return null;

            ReferralModel? linkedReferral = null;
            if (request.ReferralId.HasValue)
            {
                linkedReferral = await _context.Referrals.FindAsync(request.ReferralId.Value);
                if (linkedReferral == null || linkedReferral.Status != "Accepted")
                {
                    return null;
                }

                var userRole = _currentUserService.Role ?? string.Empty;
                if (linkedReferral.AssignedToRole != userRole)
                {
                    return null;
                }
            }

            // Find the actual PatientId linked to the provided user/patient id
            var realPatient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userOrPatientId || p.PatientId == userOrPatientId);
            if (realPatient == null)
            {
                throw new Exception($"Patient not found for the given ID: {userOrPatientId}. A valid Patient Profile must exist.");
            }

            var appointment = new AppointmentModel
            {
                DoctorId = timeSlot.Schedule?.DoctorId ?? request.DoctorId,
                PatientId = realPatient.PatientId,
                PatientExternalId = realPatient.ExternalPatientId,
                TimeSlotId = request.TimeSlotId,
                Status = "Scheduled",
                ReasonForVisit = request.ReasonForVisit,
                BookedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                ReferralId = linkedReferral?.ReferralId
            };

            timeSlot.Status = "Booked";
            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            if (linkedReferral != null)
            {
                linkedReferral.Status = "Appointment Booked";
                linkedReferral.LinkedAppointmentId = appointment.AppointmentId;
                linkedReferral.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                await _notificationService.CreateNotificationAsync(
                    linkedReferral.DoctorId,
                    new CreateNotificationRequest
                    {
                        Title = "Referral Appointment Booked",
                        Message = $"Appointment booked for {linkedReferral.PatientName} — {linkedReferral.ReferralType} on {timeSlot.SlotDate:yyyy-MM-dd}",
                        Type = "Referral"
                    });
            }

            var patientUser = await _context.Users.FindAsync(userOrPatientId);
            if (patientUser != null)
            {
                var doctor = await _context.Doctors
                    .Include(d => d.User)
                    .FirstOrDefaultAsync(d => d.DoctorId == appointment.DoctorId);

                var doctorName = doctor?.User != null
                    ? $"{doctor.User.FirstName} {doctor.User.LastName}"
                    : "Doctor";

                await _notificationService.CreateNotificationAsync(
                    userOrPatientId,
                    new CreateNotificationRequest
                    {
                        Title = "Appointment Scheduled",
                        Message = $"Your appointment with Dr. {doctorName} is on {timeSlot.SlotDate:yyyy-MM-dd} at {timeSlot.StartTime:hh\\:mm}",
                        Type = "Appointment"
                    });
            }

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

            await _notificationService.CreateNotificationAsync(
                patientId,
                new CreateNotificationRequest
                {
                    Title = "Appointment Rescheduled",
                    Message = $"Your appointment has been moved to {newSlot.SlotDate:yyyy-MM-dd} at {newSlot.StartTime:hh\\:mm}",
                    Type = "Appointment"
                });

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
            appointment.CancellationReason = request.CancellationReason;

            if (appointment.TimeSlot != null)
                appointment.TimeSlot.Status = "Available";

            await _notificationService.CreateNotificationAsync(
                patientId,
                new CreateNotificationRequest
                {
                    Title = "Appointment Cancelled",
                    Message = $"Your appointment on {appointment.TimeSlot?.SlotDate:yyyy-MM-dd} has been cancelled. Reason: {request.CancellationReason}",
                    Type = "Appointment"
                });

            await _context.SaveChangesAsync();
            return true;
        }

        // =========================
        // GET PATIENT APPOINTMENTS
        // =========================
        public async Task<List<AppointmentDTO>> GetPatientAppointmentsAsync(int userId)
        {
            // We receive the identity UserId, but the Appointments table uses the internal PatientId.
            // First we ensure the patient exists or directly query through the Patient navigation property (if linked) or by checking the Patients table.
            var realPatient = await _context.Patients.FirstOrDefaultAsync(p => p.UserId == userId);
            if (realPatient == null) return new List<AppointmentDTO>();

            var appointments = await _context.Appointments
                .Include(a => a.Doctor)
                    .ThenInclude(d => d.User)
                .Include(a => a.TimeSlot)
                .Where(a => a.PatientId == realPatient.PatientId || a.PatientExternalId == realPatient.ExternalPatientId)
                .ToListAsync();

            return appointments
                .OrderByDescending(a => a.TimeSlot.SlotDate)
                .Select(a => new AppointmentDTO
                {
                    AppointmentId = a.AppointmentId,
                    PatientId = userId,
                    DoctorId = a.DoctorId,
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
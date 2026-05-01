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

        public AppointmentService(ClinicDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<List<TimeSlotDTO>> GetAvailableSlotsAsync(int doctorId, DateTime startDate, DateTime endDate)
        {
            return await _context.TimeSlots
                .Include(ts => ts.Schedule)
                .Where(ts => ts.Schedule.DoctorId == doctorId && 
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
                .OrderBy(ts => ts.SlotDate)
                .ThenBy(ts => ts.StartTime)
                .ToListAsync();
        }

        public async Task<AppointmentDTO?> BookAppointmentAsync(int patientId, BookAppointmentRequest request)
        {
            var timeSlot = await _context.TimeSlots.FindAsync(request.TimeSlotId);
            if (timeSlot == null || timeSlot.Status != "Available")
                return null;

            var appointment = new AppointmentModel
            {
                DoctorId = request.DoctorId,
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

            // Send notification
            var doctor = await _context.Doctors.Include(d => d.User).FirstOrDefaultAsync(d => d.DoctorId == request.DoctorId);
            if (doctor?.User != null)
            {
                await _notificationService.CreateNotificationAsync(doctor.UserId, new CreateNotificationRequest
                {
                    Title = "New Appointment",
                    Message = $"Patient booked an appointment on {timeSlot.SlotDate:MMM dd, yyyy}",
                    Type = "Appointment"
                });
            }

            return await GetAppointmentDetailsAsync(appointment.AppointmentId);
        }

        public async Task<bool> RescheduleAppointmentAsync(int patientId, RescheduleAppointmentRequest request)
        {
            var appointment = await _context.Appointments
                .Include(a => a.TimeSlot)
                .FirstOrDefaultAsync(a => a.AppointmentId == request.AppointmentId && a.PatientId == patientId);

            if (appointment == null) return false;

            var newSlot = await _context.TimeSlots.FindAsync(request.NewTimeSlotId);
            if (newSlot == null || newSlot.Status != "Available") return false;

            // Free the old slot
            if (appointment.TimeSlot != null)
            {
                appointment.TimeSlot.Status = "Available";
                _context.TimeSlots.Update(appointment.TimeSlot);
            }

            // Book the new slot
            newSlot.Status = "Booked";
            appointment.TimeSlotId = request.NewTimeSlotId;
            appointment.UpdatedAt = DateTime.UtcNow;

            _context.Appointments.Update(appointment);
            _context.TimeSlots.Update(newSlot);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> CancelAppointmentAsync(int patientId, CancelAppointmentRequest request)
        {
            var appointment = await _context.Appointments
                .Include(a => a.TimeSlot)
                .FirstOrDefaultAsync(a => a.AppointmentId == request.AppointmentId && a.PatientId == patientId);

            if (appointment == null) return false;

            appointment.Status = "Cancelled";
            appointment.CanceledAt = DateTime.UtcNow;
            appointment.CancellationReason = request.CancellationReason;
            appointment.UpdatedAt = DateTime.UtcNow;

            if (appointment.TimeSlot != null)
            {
                appointment.TimeSlot.Status = "Available";
                _context.TimeSlots.Update(appointment.TimeSlot);
            }

            _context.Appointments.Update(appointment);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<AppointmentDTO>> GetPatientAppointmentsAsync(int patientId)
        {
            // FIXED: Load data first, then do string concatenation in memory
            var appointments = await _context.Appointments
                .Include(a => a.Doctor)
                    .ThenInclude(d => d.User)
                .Include(a => a.TimeSlot)
                .Where(a => a.PatientId == patientId)
                .OrderByDescending(a => a.TimeSlot.SlotDate)
                .ToListAsync();

            return appointments.Select(a => new AppointmentDTO
            {
                AppointmentId = a.AppointmentId,
                DoctorName = $"{a.Doctor.User.FirstName} {a.Doctor.User.LastName}", // String concat in memory
                PatientName = "",
                AppointmentDate = a.TimeSlot.SlotDate,
                StartTime = a.TimeSlot.StartTime,
                EndTime = a.TimeSlot.EndTime,
                Status = a.Status,
                ReasonForVisit = a.ReasonForVisit
            }).ToList();
        }

        public async Task<AppointmentDTO?> GetAppointmentDetailsAsync(int appointmentId)
        {
            // FIXED: Load data first, then do string concatenation in memory
            var appointment = await _context.Appointments
                .Include(a => a.Doctor)
                    .ThenInclude(d => d.User)
                .Include(a => a.TimeSlot)
                .FirstOrDefaultAsync(a => a.AppointmentId == appointmentId);

            if (appointment == null) return null;

            return new AppointmentDTO
            {
                AppointmentId = appointment.AppointmentId,
                DoctorName = $"{appointment.Doctor.User.FirstName} {appointment.Doctor.User.LastName}", // String concat in memory
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

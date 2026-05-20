using Microsoft.EntityFrameworkCore;
using CLINICSYSTEM.Data;
using CLINICSYSTEM.Data.DTOs;
using CLINICSYSTEM.Models;

namespace CLINICSYSTEM.Services
{
    public class ConsultationService : IConsultationService
    {
        private readonly ClinicDbContext _context;
        private readonly INotificationService _notificationService;

        public ConsultationService(ClinicDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<ConsultationDTO?> StartConsultationAsync(int appointmentId)
        {
            var appointment = await _context.Appointments
                .Include(a => a.Patient)
                .FirstOrDefaultAsync(a => a.AppointmentId == appointmentId);

            if (appointment == null) return null;

            var consultation = new ConsultationModel
            {
                AppointmentId = appointmentId,
                ConsultationDate = DateTime.UtcNow,
                StartTime = DateTime.UtcNow.TimeOfDay,
                Status = "In Progress",
                CreatedAt = DateTime.UtcNow
            };

            appointment.Status = "Active";

            _context.Consultations.Add(consultation);
            _context.Appointments.Update(appointment);
            await _context.SaveChangesAsync();

            return await GetConsultationDetailsAsync(consultation.ConsultationId);
        }

        public async Task<bool> UpdateConsultationAsync(int consultationId, UpdateConsultationRequest request)
        {
            var consultation = await _context.Consultations.FindAsync(consultationId);
            if (consultation == null) return false;

            consultation.Symptoms = request.Symptoms;
            consultation.Diagnosis = request.Diagnosis;
            consultation.Notes = request.Notes;
            consultation.UpdatedAt = DateTime.UtcNow;

            _context.Consultations.Update(consultation);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> EndConsultationAsync(int consultationId)
        {
            var consultation = await _context.Consultations
                .Include(c => c.Appointment)
                    .ThenInclude(a => a!.Doctor)
                    .ThenInclude(d => d!.User)
                .FirstOrDefaultAsync(c => c.ConsultationId == consultationId);

            if (consultation == null) return false;

            consultation.Status = "Completed";
            consultation.EndTime = DateTime.UtcNow.TimeOfDay;
            consultation.UpdatedAt = DateTime.UtcNow;

            if (consultation.Appointment != null)
            {
                consultation.Appointment.Status = "Completed";
                _context.Appointments.Update(consultation.Appointment);

                if (consultation.Appointment.PatientId.HasValue)
                {
                    var doctorName = consultation.Appointment.Doctor?.User != null
                        ? $"{consultation.Appointment.Doctor.User.FirstName} {consultation.Appointment.Doctor.User.LastName}"
                        : "Doctor";

                    await _notificationService.CreateNotificationAsync(
                        consultation.Appointment.PatientId.Value,
                        new CreateNotificationRequest
                        {
                            Title = "Consultation Complete",
                            Message = $"Your consultation with Dr. {doctorName} is complete. Check your records.",
                            Type = "Consultation"
                        });
                }
            }

            _context.Consultations.Update(consultation);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ConsultationDTO?> GetConsultationDetailsAsync(int consultationId)
        {
            return await _context.Consultations
                .Include(c => c.Appointment)
                    .ThenInclude(a => a.Patient)
                .Where(c => c.ConsultationId == consultationId)
                .Select(c => new ConsultationDTO
                {
                    ConsultationId = c.ConsultationId,
                    AppointmentId = c.AppointmentId,
                    PatientName = c.Appointment.Patient.FullName,
                    ConsultationDate = c.ConsultationDate,
                    Status = c.Status,
                    Symptoms = c.Symptoms,
                    Diagnosis = c.Diagnosis,
                    Notes = c.Notes
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<PendingConsultationDTO>> GetDoctorPendingConsultationsAsync(int doctorId)
        {
            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);

            var appointments = await _context.Appointments
                .Include(a => a.Patient)
                .Include(a => a.TimeSlot)
                .Include(a => a.Consultation)
                .Where(a =>
                    a.DoctorId == doctorId &&
                    a.TimeSlot != null &&
                    a.TimeSlot.SlotDate >= today &&
                    a.TimeSlot.SlotDate < tomorrow &&
                    a.Status != "Cancelled" &&
                    a.Status != "Completed")
                .ToListAsync();

            return appointments
                .Where(a => a.Consultation == null || a.Consultation.Status != "Completed")
                .OrderBy(a => a.TimeSlot!.StartTime)
                .Select(a => new PendingConsultationDTO
                {
                    AppointmentId = a.AppointmentId,
                    PatientName = a.Patient?.FullName ?? "Patient",
                    AppointmentDate = a.TimeSlot!.SlotDate,
                    StartTime = a.TimeSlot.StartTime,
                    EndTime = a.TimeSlot.EndTime,
                    Status = a.Status,
                    ReasonForVisit = a.ReasonForVisit
                })
                .ToList();
        }

        public async Task<List<PatientConsultationHistoryDTO>> GetPatientConsultationHistoryAsync(int patientId)
        {
            return await _context.Consultations
                .Include(c => c.Appointment)
                    .ThenInclude(a => a.Doctor)
                        .ThenInclude(d => d.User)
                .Where(c => c.Appointment.PatientId == patientId && c.Status == "Completed")
                .OrderByDescending(c => c.ConsultationDate)
                .Select(c => new PatientConsultationHistoryDTO
                {
                    ConsultationId = c.ConsultationId,
                    ConsultationDate = c.ConsultationDate,
                    DoctorName = c.Appointment.Doctor.User.FirstName + " " + c.Appointment.Doctor.User.LastName,
                    Diagnosis = c.Diagnosis,
                    Notes = c.Notes
                })
                .ToListAsync();
        }
    }
}

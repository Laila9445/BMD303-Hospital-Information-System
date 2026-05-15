using CLINICSYSTEM.Data;
using CLINICSYSTEM.Data.DTOs;
using CLINICSYSTEM.Models;
using Microsoft.EntityFrameworkCore;

namespace CLINICSYSTEM.Services
{
    public class PatientPortalService : IPatientPortalService
    {
        private readonly ClinicDbContext _context;
        private readonly ILogger<PatientPortalService> _logger;

        public PatientPortalService(
            ClinicDbContext context,
            ILogger<PatientPortalService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // =========================
        // PROFILE
        // =========================
        public async Task<PatientProfileDTO?> GetPatientProfileAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null;

            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.UserId == userId);

            return new PatientProfileDTO
            {
                UserId = user.Id,
                FullName = $"{user.FirstName} {user.LastName}",
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                DateOfBirth = patient?.DateOfBirth ?? DateTime.MinValue,
                Gender = patient?.Gender ?? string.Empty,
                Address = patient?.Address ?? string.Empty,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };
        }

        public async Task<bool> UpdatePatientProfileAsync(int userId, UpdatePatientProfileRequest request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.UserId == userId);

            var nameParts = request.FullName.Split(' ', 2);

            user.FirstName = nameParts[0];
            user.LastName = nameParts.Length > 1 ? nameParts[1] : user.LastName;
            user.PhoneNumber = request.PhoneNumber;
            user.UpdatedAt = DateTime.UtcNow;

            if (patient != null)
            {
                patient.FullName = request.FullName;
                patient.PhoneNumber = request.PhoneNumber;
                patient.DateOfBirth = request.DateOfBirth;
                patient.Gender = request.Gender;
                patient.Address = request.Address;
                patient.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        // =========================
        // MEDICAL HISTORY
        // =========================
        public async Task<MedicalHistoryDTO?> GetMedicalHistoryAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return null;

            return new MedicalHistoryDTO
            {
                UserId = userId,
                Allergies = null,
                ChronicConditions = null,
                CurrentMedications = null,
                BloodType = null,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };
        }

        public async Task<bool> UpdateMedicalHistoryAsync(int userId, UpdateMedicalHistoryRequest request)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        // =========================
        // APPOINTMENTS
        // =========================
        public async Task<List<AppointmentDTO>> GetPatientAppointmentsAsync(int userId)
        {
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (patient == null) return new List<AppointmentDTO>();

            return await _context.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d!.User)
                .Include(a => a.TimeSlot)
                .Where(a => a.PatientId == patient.PatientId)
                .Select(a => new AppointmentDTO
                {
                    AppointmentId = a.AppointmentId,
                    DoctorName = a.Doctor != null && a.Doctor.User != null
                        ? $"{a.Doctor.User.FirstName} {a.Doctor.User.LastName}"
                        : "Unknown",
                    PatientName = patient.FullName,
                    AppointmentDate = a.TimeSlot != null ? a.TimeSlot.SlotDate : default,
                    StartTime = a.TimeSlot != null ? a.TimeSlot.StartTime : default,
                    EndTime = a.TimeSlot != null ? a.TimeSlot.EndTime : default,
                    Status = a.Status ?? string.Empty,
                    ReasonForVisit = a.ReasonForVisit
                })
                .ToListAsync();
        }

        // =========================
        // PRESCRIPTIONS
        // =========================
        public async Task<List<PatientPrescriptionDTO>> GetPatientPrescriptionsAsync(int userId)
        {
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (patient == null) return new List<PatientPrescriptionDTO>();

            return await _context.Prescriptions
                .Include(p => p.Consultation)
                .ThenInclude(c => c!.Appointment)
                .Where(p =>
                    p.Consultation != null &&
                    p.Consultation.Appointment != null &&
                    p.Consultation.Appointment.PatientId == patient.PatientId)
                .Select(p => new PatientPrescriptionDTO
                {
                    PrescriptionId = p.PrescriptionId,
                    DateIssued = p.CreatedAt,
                    MedicationName = p.MedicationName,
                    Dosage = p.Dosage,
                    Frequency = p.Frequency,
                    DurationDays = p.DurationDays,
                    Status = p.Status ?? string.Empty
                })
                .ToListAsync();
        }

        // =========================
        // MEDICAL IMAGES
        // =========================
        public async Task<MedicalImageDTO?> UploadMedicalImageAsync(int userId, UploadMedicalImageRequest request)
        {
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (patient == null) return null;

            var image = new MedicalImageModel
            {
                PatientId = patient.PatientId,
                ImageType = request.ImageType,
                FileName = request.File.FileName,
                FilePath = $"uploads/{request.File.FileName}",
                FileSizeBytes = request.File.Length,
                DateUploaded = DateTime.UtcNow,
                Description = request.Description
            };

            _context.MedicalImages.Add(image);
            await _context.SaveChangesAsync();

            return new MedicalImageDTO
            {
                ImageId = image.ImageId,
                ImageType = image.ImageType,
                FileName = image.FileName,
                DateUploaded = image.DateUploaded,
                FileSizeBytes = image.FileSizeBytes,
                Description = image.Description
            };
        }

        public async Task<List<MedicalImageDTO>> GetMedicalImagesAsync(int userId)
        {
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (patient == null) return new List<MedicalImageDTO>();

            return await _context.MedicalImages
                .Where(m => m.PatientId == patient.PatientId)
                .OrderByDescending(m => m.DateUploaded)
                .Select(m => new MedicalImageDTO
                {
                    ImageId = m.ImageId,
                    ImageType = m.ImageType,
                    FileName = m.FileName,
                    DateUploaded = m.DateUploaded,
                    FileSizeBytes = m.FileSizeBytes,
                    Description = m.Description
                })
                .ToListAsync();
        }

        // =========================
        // DASHBOARD STATS (FIXED)
        // =========================
        public async Task<PatientDashboardStatsDTO> GetPatientDashboardStatsAsync(int userId)
        {
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (patient == null)
            {
                return new PatientDashboardStatsDTO
                {
                    TotalAppointments = 0,
                    UpcomingAppointments = 0,
                    TotalPrescriptions = 0,
                    TotalMedicalImages = 0
                };
            }

            var today = DateTime.UtcNow.Date;

            var totalAppointments = await _context.Appointments
                .CountAsync(a => a.PatientId == patient.PatientId);

            var upcomingAppointments = await _context.Appointments
                .Include(a => a.TimeSlot)
                .CountAsync(a =>
                    a.PatientId == patient.PatientId &&
                    a.TimeSlot != null &&
                    a.TimeSlot.SlotDate >= today);

            var totalPrescriptions = await _context.Prescriptions
                .Include(p => p.Consultation)
                .ThenInclude(c => c!.Appointment)
                .CountAsync(p =>
                    p.Consultation != null &&
                    p.Consultation.Appointment != null &&
                    p.Consultation.Appointment.PatientId == patient.PatientId);

            var totalMedicalImages = await _context.MedicalImages
                .CountAsync(m => m.PatientId == patient.PatientId);

            return new PatientDashboardStatsDTO
            {
                TotalAppointments = totalAppointments,
                UpcomingAppointments = upcomingAppointments,
                TotalPrescriptions = totalPrescriptions,
                TotalMedicalImages = totalMedicalImages
            };
        }
    }
}